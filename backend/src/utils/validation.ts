import { z } from "zod";

export const reportSchema = z.object({
  device_type: z.string(),
  device_model: z.string(),
  operating_system: z.string(),
  other_operating_system: z.string().optional(),
  app_version: z.string(),
  incident_date: z.string().transform((val) => {
    // Check if it's MM/DD/YYYY format
    if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return val;
    }
    
    // Try to parse as a date object and format it
    try {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      }
    } catch (e) {
      // If parsing fails, return the original value for the refine check to handle
    }
    
    return val;
  }).refine((val) => {
    // Check if the string is a valid date in YYYY-MM-DD format
    return /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(new Date(val).getTime());
  }, {
    message: "Invalid date format. Please use YYYY-MM-DD format."
  }), 
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
  .optional(),
  file_urls: z.array(z.string()).optional(),
  pdf_url: z.string().optional()
});