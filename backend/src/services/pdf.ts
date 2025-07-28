// @ts-ignore: Deno environment
import { PDFDocument } from "npm:pdf-lib";
// @ts-ignore: Deno environment
import { reportSchema } from "../utils/validation.ts";
// @ts-ignore: Deno environment
import { z } from "npm:zod";

type ReportData = z.infer<typeof reportSchema>;

export async function generatePDF(data: ReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const { height } = page.getSize();
  const fontSize = 12;
  let y = height - 50;

  // Add a title
  page.drawText("Bug Report", {
    x: 50,
    y,
    size: fontSize + 4,
  });
  y -= fontSize + 20;

  for (const [key, value] of Object.entries(data)) {
    // Skip file-related fields and complex objects
    if (key === 'screenshots' || key === 'file_urls' || key === 'pdf_url') {
      continue;
    }
    
    // Format the value for display
    let displayValue = value;
    if (typeof value === 'object') {
      displayValue = JSON.stringify(value);
    }
    
    // Format the key for better readability
    const formattedKey = key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    page.drawText(`${formattedKey}: ${displayValue}`, {
      x: 50,
      y,
      size: fontSize,
    });
    y -= fontSize + 10;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}