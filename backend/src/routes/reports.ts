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

    // --- Start of Screenshot and File Processing ---
    const fileUrls: string[] = [];
    const validatedScreenshotFiles = reportData.screenshots;

    if (validatedScreenshotFiles && validatedScreenshotFiles.length > 0) {
      console.log(`Processing ${validatedScreenshotFiles.length} validated screenshot files.`);

      for (const file of validatedScreenshotFiles) {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

        // File size validation
        if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
          return c.json({ error: "Video size exceeds 50MB limit" }, 400);
        }
        if (!file.type.startsWith('video/') && file.size > 10 * 1024 * 1024) {
          return c.json({ error: "Image/File size exceeds 10MB limit" }, 400);
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

          console.log("Uploading to S3:", processedFile.name);
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
    } else {
      console.log("No validated screenshot files to process.");
    }
    // --- End of Screenshot and File Processing ---

    // --- Start of PDF Generation and Upload ---
    let pdfS3Url: string | undefined;
    try {
      console.log("Generating PDF prior to main DB insert...");
      // Pass the full reportData to generatePDF so it has all fields for the report
      const pdfBuffer = await generatePDF(reportData);
      pdfS3Url = await uploadToS3(new File([pdfBuffer], 'report.pdf', { type: 'application/pdf' }));
      console.log("PDF generated and S3 URL obtained:", pdfS3Url);
    } catch (pdfError) {
      console.error("PDF generation/upload error before DB insert:", pdfError);
      // Fail the whole request if PDF generation fails, as it's a required part of the process
      return c.json({ error: "Failed to generate PDF, report not saved." }, 500);
    }
    // --- End of PDF Generation and Upload ---


    // --- Start of Supabase Database Insertion ---
    console.log("All files and PDF processed, preparing for Supabase insert.");

    // Remove the 'screenshots' property (which contains File objects) before insertion
    const { screenshots, ...dataToInsert } = reportData;

    const payloadForSupabase = {
      ...dataToInsert,
      file_urls: fileUrls, // Add the array of screenshot URLs
      pdf_url: pdfS3Url    // Add the PDF URL
    };

    console.log("Final payload for Supabase:", payloadForSupabase);

    // Save the complete record to Supabase
    const { error: insertError } = await supabase
      .from('reports')
      .insert([payloadForSupabase]);

    if (insertError) {
      console.error("Supabase error:", insertError);
      return c.json({ error: insertError.message }, 500);
    }

    console.log("Report and all URLs saved to database successfully.");
    // --- End of Supabase Database Insertion ---

    // --- Final Success Response ---
    return c.json({
      message: 'Report submitted successfully',
      fileUrls: fileUrls, // Return the array of screenshot URLs
      pdfUrl: pdfS3Url      // Return the PDF URL
    }, 201);

  } catch (error) {
    console.error("A top-level server error occurred:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});