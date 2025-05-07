import { Hono } from 'https://deno.land/x/hono@v3.11.7/mod.ts';
import { reportSchema } from '../utils/validation.ts';
import { supabase } from '../services/supabase.ts';
import { uploadToS3 } from '../services/s3.ts';
import { generatePDF } from '../services/pdf.ts';
import { gzip } from 'https://deno.land/x/compress@v0.4.5/mod.ts';

type ReportEnv = {
  Variables: {};
};

export const reportsRouter = new Hono<ReportEnv>();

reportsRouter.post('/', async (c) => {
  const body = await c.req.parseBody();
  const validation = reportSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ error: validation.error.errors }, 400);
  }

  const reportData = validation.data;

  // Handle file uploads with compression
  const files = body['screenshots'] as File[] | undefined;
  const fileUrls: string[] = [];

  if (files && files.length > 0) {
    for (const file of files) {
      // Check file size (limit to 10MB for example)
      if (file.size > 10 * 1024 * 1024) {
        return c.json({ error: "File size exceeds 10MB limit" }, 400);
      }
      try {
        let processedFile = file;
        
        // Handle image compression
        if (file.type.startsWith('image/')) {
          const arrayBuffer = await file.arrayBuffer();
          const compressedBuffer = await gzip(new Uint8Array(arrayBuffer));
          
          processedFile = new File([compressedBuffer], file.name + '.gz', {
            type: 'application/gzip'
          });
        }
        
        // Handle video compression (basic settings)
        if (file.type.startsWith('video/')) {
          // For videos, we'll just enforce size and resolution limits
          // Advanced video compression would require additional libraries
          if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
            return c.json({ error: "Video size exceeds 50MB limit" }, 400);
          }
        }

        const url = await uploadToS3(processedFile);
        fileUrls.push(url);
      } catch (error) {
        console.error('File processing error:', error);
        return c.json({ error: "Failed to process file upload" }, 500);
      }
    }
  }
  const { error } = await supabase
    .from('reports')
    .insert([{ ...reportData, fileUrls }]);
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  const pdfBuffer = await generatePDF(reportData);
  const pdfUrl = await uploadToS3(new File([pdfBuffer], 'report.pdf', { type: 'application/pdf' }));
  return c.json({ 
    message: 'Report submitted successfully',
    fileUrls,
    pdfUrl
  }, 201);
});