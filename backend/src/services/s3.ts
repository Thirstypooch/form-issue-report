import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3';

const s3 = new S3Client({
  region: Deno.env.get('FORM_AWS_REGION')!,
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
});

export async function uploadToS3(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const command = new PutObjectCommand({
    Bucket: Deno.env.get('S3_BUCKET_NAME')!,
    Key: `uploads/${file.name}`,
    Body: buffer,
    ContentType: file.type,
  });

  await s3.send(command);

  return `https://${Deno.env.get('S3_BUCKET_NAME')}.s3.amazonaws.com/uploads/${file.name}`;
}