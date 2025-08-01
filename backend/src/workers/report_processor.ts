// @ts-ignore: Deno environment
import "https://deno.land/std@0.224.0/dotenv/load.ts"; // Ensure dotenv is loaded for env vars
// @ts-ignore: Deno environment
import { subscribeToReports } from '../services/pubsub.ts';
// @ts-ignore: Deno environment
import { uploadToS3 } from '../services/s3.ts';
// @ts-ignore: Deno environment
import { generatePDF } from '../services/pdf.ts';
// @ts-ignore: Deno environment
import { supabase } from '../services/supabase.ts';
// @ts-ignore: Deno environment
import { z } from "npm:zod"; // Needed for Zod operations
// @ts-ignore: Deno environment
import { reportSchema } from "../utils/validation.ts";
// @ts-ignore: Deno environment
import { sendReportEmail } from '../services/email.ts';


const pubSubPayloadSchema = reportSchema.extend({
  report_id: z.string().uuid({ message: "Invalid report ID format" })
}).omit({
  pdf_url: true
});

type ReportPayloadFromPubSub = z.infer<typeof pubSubPayloadSchema>;

async function processReportMessage(rawReportPayload: any) {
  const reportId = rawReportPayload?.report_id || 'UNKNOWN_ID';
  console.log(`[Worker] Starting processing for report ID: ${reportId}`);

  try {
    const validationResult = pubSubPayloadSchema.safeParse(rawReportPayload);

    if (!validationResult.success) {
      console.error(`[Worker] Invalid Pub/Sub message schema for report ID ${reportId}:`, validationResult.error.errors);
      throw new Error(`Invalid message payload for report ID ${reportId}: ${JSON.stringify(validationResult.error.errors)}`);
    }

    // 2. Now that validation passed, declare your variables ONCE
    const validatedPayload: ReportPayloadFromPubSub = validationResult.data;
    const { report_id, file_urls, user_email, ...coreReportData } = validatedPayload;

    if (coreReportData.incident_date) {
      try {
        coreReportData.incident_date = new Date(coreReportData.incident_date).toISOString();
      } catch (e) {
        console.warn(`[Worker] Error re-formatting incident_date for report ID ${report_id}: ${coreReportData.incident_date}. Fallback to string if unparseable.`);
      }
    }

    const pdfBuffer = await generatePDF(coreReportData);
    const pdfS3Url = await uploadToS3(new File([pdfBuffer], `${report_id}-report.pdf`, { type: 'application/pdf' }));
    console.log(`[Worker] PDF generated and uploaded to S3 for report ID ${report_id}: ${pdfS3Url}`);

    const payloadForSupabase = {
      ...coreReportData,
      user_email: user_email,
      report_id: report_id,
      file_urls: file_urls,
      pdf_url: pdfS3Url,
    };

    const { error: insertError } = await supabase.from('reports').insert([payloadForSupabase]);

    if (insertError) {
      console.error(`[Worker] Supabase insertion error for report ID ${report_id}:`, insertError);
      throw insertError;
    }

    console.log(`[Worker] Report ID ${report_id} processed and saved successfully to Supabase.`);

    if (user_email) {
      await sendReportEmail({
        to: user_email,
        reportId: report_id,
        pdfUrl: pdfS3Url
      });
    }

  } catch (error) {
    console.error(`[Worker] Fatal error processing report ID: ${reportId}`, error);
    throw error;
  }
}
// @ts-ignore: Deno environment
subscribeToReports(Deno.env.get('PUBSUB_SUBSCRIPTION_NAME') || 'report-processor-subscription', processReportMessage);
console.log('[Worker] Report processor started. Waiting for messages...');