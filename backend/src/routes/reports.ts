import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { reportSchema } from "../utils/validation.ts";
import { supabase } from "../services/supabase.ts";
import { uploadToS3 } from "../services/s3.ts";
import { generatePDF } from "../services/pdf.ts";
import { gzip } from "compress";

// --- Main App Setup (from your old index.ts) ---
type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // Local Vue dev server
  Deno.env.get('URL'),      // Netlify's main production URL
  Deno.env.get('DEPLOY_PRIME_URL') // Netlify's URL for deploy previews
].filter(Boolean) as string[];

app.use('/*', cors({
  origin: (origin, _c) => {
    if (allowedOrigins.includes(origin)) {
      return origin;
    }
    return allowedOrigins[0];
  },
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// --- Routing Logic (from your old reports.ts) ---
const reportsRouter = new Hono();

reportsRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: validation.error.errors }, 400);
    }

    const reportData = validation.data;

    // Format the incident_date
    if (reportData.incident_date) {
      reportData.incident_date = new Date(reportData.incident_date).toISOString();
    }

    // Handle Screenshot Uploads
    const fileUrls: string[] = [];
    const validatedScreenshotFiles = reportData.screenshots;

    if (validatedScreenshotFiles && validatedScreenshotFiles.length > 0) {
      for (const file of validatedScreenshotFiles) {
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          const arrayBuffer = await file.arrayBuffer();
          const compressedBuffer = await gzip(new Uint8Array(arrayBuffer));
          processedFile = new File([compressedBuffer], file.name + '.gz', { type: 'application/gzip' });
        }
        const url = await uploadToS3(processedFile);
        fileUrls.push(url);
      }
    }

    // Generate and Upload PDF
    const pdfBuffer = await generatePDF(reportData);
    const pdfS3Url = await uploadToS3(new File([pdfBuffer], 'report.pdf', { type: 'application/pdf' }));

    // Prepare data for Supabase
    const { screenshots, ...dataToInsert } = reportData;
    const payloadForSupabase = {
      ...dataToInsert,
      file_urls: fileUrls,
      pdf_url: pdfS3Url,
    };

    // Insert into Supabase
    const { error: insertError } = await supabase.from('reports').insert([payloadForSupabase]);

    if (insertError) {
      throw insertError;
    }

    return c.json({
      message: 'Report submitted successfully',
      fileUrls,
      pdfUrl: pdfS3Url
    }, 201);

  } catch (error) {
    console.error("A server error occurred:", error);
    return c.json({
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Mount the router onto the main app at the desired path
// Note: Since the Netlify redirect is to '/api/*', the path here is just '/'
app.route('/reports', reportsRouter);

// Export the Hono app instance as the default handler
export default app;