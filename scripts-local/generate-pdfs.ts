import { PDFDocument, rgb, cmyk } from 'pdf-lib';
import fs from 'fs';

async function generate() {
  // 1. Generate Bad PDF (Small size, RGB color)
  const badPdf = await PDFDocument.create();
  const badPage = badPdf.addPage([50, 50]); // Too small (< 100pt)
  badPage.drawText('Bad RGB Text', { x: 5, y: 25, color: rgb(1, 0, 0) }); // RGB
  
  const badBytes = await badPdf.save();
  fs.writeFileSync('bad.pdf', badBytes);
  console.log(`Created bad.pdf (${badBytes.length} bytes)`);

  // 2. Generate Good PDF (A4 size, CMYK color, artificially padded to be > 10KB)
  const goodPdf = await PDFDocument.create();
  const goodPage = goodPdf.addPage([595, 842]); // A4
  goodPage.drawText('Good CMYK Text', { x: 50, y: 800, color: cmyk(1, 0, 0, 0) }); // CMYK
  
  // Pad the file with a large dummy metadata field to bypass the 10KB resolution hack
  goodPdf.setAuthor('a'.repeat(15000)); 

  const goodBytes = await goodPdf.save();
  fs.writeFileSync('good.pdf', goodBytes);
  console.log(`Created good.pdf (${goodBytes.length} bytes)`);
}

generate().catch(console.error);
