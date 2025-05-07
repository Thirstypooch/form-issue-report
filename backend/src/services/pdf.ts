import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@1.17.1?dts';

export async function generatePDF(data: Record<string, any>): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const { width, height } = page.getSize();
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