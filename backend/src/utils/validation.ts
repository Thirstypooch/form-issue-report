// @ts-ignore: Deno environment
import { z } from 'npm:zod'

export const reportSchema = z.object({
  user_email: z.string().email({ message: "Invalid email address." }),
  device_type: z.string(),
  device_model: z.string(),
  operating_system: z.string(),
  other_operating_system: z.string().optional(),
  app_version: z.string(),
  incident_date: z.string().refine(
    (val) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(val) || !isNaN(Date.parse(val))
    },
    {
      message: 'Invalid date format. Please use YYYY-MM-DD.'
    }
  ),
  problem_description: z.string(),
  reproducion_steps: z.string(),
  expected_behavior: z.string(),
  actual_behavior: z.string(),
  severity_level: z.string(),
  has_previously_occurred: z.string(),
  additional_comments: z.string(),
  file_urls: z.array(z.string().url()).optional(),
  pdf_url: z.string().optional()
})
