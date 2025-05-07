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
  screenshots: z
  .array(z.instanceof(File))
  .refine(
    (files) =>
      files.every((file) =>
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)
      ),
    { message: 'Only images and videos (JPEG, PNG, MP4, etc.) are allowed' }
  )
  .optional()
});