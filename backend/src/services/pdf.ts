import { PDFDocument } from "pdf-lib";
import { reportSchema } from "../utils/validation.ts";
import { z } from "zod";

type ReportData = z.infer<typeof reportSchema>;

export async function generatePDF(data: ReportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const { height } = page.getSize();
  const fontSize = 12;
  let y = height - 50;

  for (const [key, value] of Object.entries(data)) {
    page.drawText(`${key}: ${value}`, {
      x: 50,
      y,
      size: fontSize,
    });
    y -= fontSize + 10;
  }

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}