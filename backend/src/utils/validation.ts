import { z } from 'zod'

export const reportSchema = z.object({
  device_type: z.string(),
  device_model: z.string(),
  operating_system: z.string(),
  other_operating_system: z.string().optional(),
  app_version: z.string(),
  incident_date: z.string().refine(
    (val) => {
      // Accept both YYYY-MM-DD and ISO 8601
      return /^\d{4}-\d{2}-\d{2}$/.test(val) || !isNaN(Date.parse(val))
    },
    {
      message: 'Invalid date format. Please use YYYY-MM-DD or ISO 8601 format.'
    }
  ),
  problem_description: z.string(),
  reproducion_steps: z.string(),
  expected_behavior: z.string(),
  actual_behavior: z.string(),
  severity_level: z.string(),
  has_previously_occurred: z.string(),
  additional_comments: z.string(),
  screenshots: z.preprocess(
    // (1) Preprocessing step
    (arg) => {
      // If arg is a single File object (and not already an array)
      if (arg instanceof File && !Array.isArray(arg)) {
        return [arg] // Wrap it in an array
      }
      // If it's already an array, or undefined/null (for optional), pass it through
      return arg
    },
    // (2) The original validation logic, which now receives a guaranteed array (if files were present)
    z
      .array(z.instanceof(File)) // (A) Still expects an array (which preprocess ensures)
      .refine(
        // (B) Your exact refine logic is here
        (files) =>
          files.every((file) =>
            [
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/webp',
              'video/mp4',
              'video/webm',
              'video/quicktime'
            ].includes(file.type)
          ),
        { message: 'Only images and videos (JPEG, PNG, MP4, etc.) are allowed' }
      )
      .optional()
  ),
  file_urls: z.array(z.string()).optional(),
  pdf_url: z.string().optional()
})
