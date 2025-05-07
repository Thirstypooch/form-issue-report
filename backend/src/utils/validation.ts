import { z } from "zod";

export const reportSchema = z.object({
  deviceType: z.string(),
  deviceModel: z.string(),
  operatingSystem: z.string(),
  otherOperatingSystem: z.string().optional(),
  appVersion: z.string(),
  incidentDate: z.string(),
  problemDescription: z.string(),
  reproduccionSteps: z.string(),
  expectedBehavior: z.string(),
  actualBehavior: z.string(),
  severityLevel: z.string(),
  hasPreviouslyOccurred: z.string(),
  additionalComments: z.string(),
  screenshots: z.array(z.instanceof(File)).refine((files) => {
    return files.every(file => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ];
      return validTypes.includes(file.type);
    }), {
      message: "Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, QuickTime) are allowed"
    }})
});