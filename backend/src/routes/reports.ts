// @ts-ignore: Deno environment
import "https://deno.land/std@0.224.0/dotenv/load.ts";
// @ts-ignore: Deno environment
import { Hono } from "npm:hono";
// @ts-ignore: Deno environment
import { cors } from "npm:hono/cors";
// @ts-ignore: Deno environment
import { reportSchema } from "../utils/validation.ts";
// @ts-ignore: Deno environment
import { publishReport } from "../services/pubsub.ts";
// @ts-ignore: Deno environment
import { getSignedUrl } from "s3-request-presigner";
// @ts-ignore: Deno environment
import { s3 } from "../services/s3.ts";
// @ts-ignore: Deno environment
import { PutObjectCommand } from "npm:@aws-sdk/client-s3";

// --- Main App Setup ---
type AppEnv = {
  Variables: {};
};

const app = new Hono<AppEnv>();

const allowedOrigins = [
  'http://localhost:5173',
];

const frontendUrl = Deno.env.get('FRONTEND_URL');
if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

app.use('/*', cors({
  origin: allowedOrigins,
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));

const reportsRouter = new Hono();

reportsRouter.post('/', async (c) => {
  const reportId = crypto.randomUUID();
  console.log(`Received report submission. Assigning ID: ${reportId}`);

  try {
    const body = await c.req.json();
    const validation = reportSchema.safeParse(body);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);
      return c.json({ error: validation.error.errors }, 400);
    }

    const reportData = validation.data;

    const payloadForPubSub = {
      report_id: reportId,
      ...reportData,
    };

    await publishReport(payloadForPubSub);
    console.log(`Report data for ID ${reportId} published to Pub/Sub topic.`);

    return c.json({
      message: 'Report received and queued for processing.',
      reportId: reportId
    }, 202);

  } catch (error) {
    console.error(`A server error occurred for report ID ${reportId} during reception or queuing:`, error);
    return c.json({
      error: 'An internal server error occurred while processing your request. Please try again later.'
    }, 500);
  }
});

app.route('/reports', reportsRouter);

const presignedUrlRouter = new Hono();

presignedUrlRouter.post('/presigned-url', async (c) => {
  try {
    const { fileName, fileType } = await c.req.json();
    const reportId = crypto.randomUUID();

    const key = `uploads/${reportId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: Deno.env.get('S3_BUCKET_NAME')!,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicUrl = `https://${Deno.env.get('S3_BUCKET_NAME')}.s3.amazonaws.com/${key}`;

    return c.json({ url: signedUrl, s3ObjectUrl: publicUrl });
  } catch (error) {
    console.error('Failed to create pre-signed URL', error);
    return c.json({ error: 'Could not create upload URL.' }, 500);
  }
});

app.route('/', presignedUrlRouter);

export default app;