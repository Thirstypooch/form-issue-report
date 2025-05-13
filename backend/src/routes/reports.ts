import { Hono } from "hono";
import { reportSchema } from "../utils/validation.ts";
import { supabase } from "../services/supabase.ts";
import { uploadToS3 } from "../services/s3.ts";
import { generatePDF } from "../services/pdf.ts";
import { gzip } from "compress";

type ReportEnv = {
  Variables: {};
};

export const reportsRouter = new Hono<ReportEnv>();

reportsRouter.post('/', async (c) => {
  try {
    console.log("Received request");
    const body = await c.req.parseBody();
    console.log("Parsed body:", body);

    // Add this log to see the incident_date value
    console.log('Received incident_date:', body['incident_date']);

    const validation = reportSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error.errors);
      return c.json({ error: validation.error.errors }, 400);
    }

    console.log("Validation successful");
    const reportData = validation.data;

    // Format the incident_date as a proper timestamp
    if (reportData.incident_date) {
      const date = new Date(reportData.incident_date);
      if (!isNaN(date.getTime())) {
        reportData.incident_date = date.toISOString();
      } else {
        return c.json({ error: "Invalid date format for incident_date" }, 400);
      }
    }

    // Handle file uploads
    const files = body['screenshots'] as File[] | undefined;
    const fileUrls: string[] = [];

    if (files && files.length > 0) {
      console.log(`Processing ${files.length} files`);

      for (const file of files) {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

        if (file.size > 10 * 1024 * 1024) {
          return c.json({ error: "File size exceeds 10MB limit" }, 400);
        }

        try {
          let processedFile = file;

          if (file.type.startsWith('image/')) {
            console.log("Compressing image file");
            const arrayBuffer = await file.arrayBuffer();
            const compressedBuffer = await gzip(new Uint8Array(arrayBuffer));

            processedFile = new File([compressedBuffer], file.name + '.gz', {
              type: 'application/gzip'
            });
            console.log("Image compressed successfully");
          }

          if (file.type.startsWith('video/')) {
            if (file.size > 50 * 1024 * 1024) { 
              return c.json({ error: "Video size exceeds 50MB limit" }, 400);
            }
            console.log("Processing video file");
          }

          console.log("Uploading to S3");
          const url = await uploadToS3(processedFile);
          console.log("File uploaded successfully, URL:", url);
          fileUrls.push(url);
        } catch (fileError) {
          console.error('File processing error:', fileError);
          return c.json({ 
            error: `Failed to process file upload: ${fileError instanceof Error ? fileError.message : String(fileError)}` 
          }, 500);
        }
      }
    }

    console.log("All files processed, inserting to Supabase");

    // Remove screenshots field from reportData as it doesn't exist in the database schema
    const { screenshots, ...dataToInsert } = reportData;
    console.log("Data being prepared for Supabase (dataToInsert):", dataToInsert);
    console.log("File URLs being added:", fileUrls);

    const payloadForSupabase = { ...dataToInsert, file_urls: fileUrls };
    console.log("Final payload for Supabase:", payloadForSupabase);


    const { error } = await supabase
      .from('reports')
      .insert([payloadForSupabase]);

    if (error) {
      console.error("Supabase error:", error);
      return c.json({ error: error.message }, 500);
    }

    console.log("Report saved to database, generating PDF");

    // Generate PDF
    try {
      const pdfBuffer = await generatePDF(reportData);
      console.log("PDF generated, uploading to S3");

      const pdfUrl = await uploadToS3(new File([pdfBuffer], 'report.pdf', { type: 'application/pdf' }));
      console.log("PDF uploaded, URL:", pdfUrl);

      return c.json({ 
        message: 'Report submitted successfully',
        fileUrls,
        pdfUrl
      }, 201);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return c.json({ 
        message: 'Report saved but PDF generation failed',
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        fileUrls
      }, 500);
    }

  } catch (error) {
    console.error("Server error:", error);
    return c.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, 500);
  }
});
