import { z } from "zod";

export const reportSchema = z.object({
  device_type: z.string(),
  device_model: z.string(),
  operating_system: z.string(),
  other_operating_system: z.string().optional(),
  app_version: z.string(),
  incident_date: z.string(), 
  problem_description: z.string(),
  reproducion_steps: z.string(), 
  expected_behavior: z.string(),
  actual_behavior: z.string(),
  severity_level: z.string(),
  has_previously_occurred: z.string(),
  additional_comments: z.string(),
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