// @ts-ignore: Deno environment
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailOptions {
  to: string;
  reportId: string;
  pdfUrl: string;
}

export async function sendReportEmail({ to, reportId, pdfUrl }: EmailOptions): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error('[Email] RESEND_API_KEY is not configured. Skipping email.');
    return;
  }

  const payload = {
    from: 'Bug Reports <reports@thirstypooch.dynv6.net>',
    to: [to],
    subject: `Report Confirmation - ID: ${reportId}`,
    html: `
      <h1>Report Received</h1>
      <p>Thank you for your submission. Your report with ID <strong>${reportId}</strong> has been received and is being processed.</p>
      <p>You can view the generated PDF report here:</p>
      <a href="${pdfUrl}">View PDF Report</a>
      <p>We appreciate your help in improving our application.</p>
    `,
    attachments: [
      {
        filename: `report-${reportId}.pdf`,
        path: pdfUrl,
      },
    ],
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(`Failed to send email: ${JSON.stringify(errorBody)}`);
    }

    console.log(`[Email] Confirmation sent successfully to ${to} for report ${reportId}`);
  } catch (error) {
    console.error('[Email] Error sending confirmation email:', error);
  }
}