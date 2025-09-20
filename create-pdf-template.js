/**
 * Sample script to create an indigency certificate PDF template with AcroForm fields
 * 
 * To create your PDF template with AcroForm fields, you can:
 * 1. Use Adobe Acrobat Pro to add form fields to your existing certificate
 * 2. Use online PDF form creators like PDF24, PDFEscape, or JotForm
 * 3. Use this sample script as reference
 * 
 * Required field names for the application:
 * - applicant_name, name, or full_name (for full name)
 * - applicant_address or address (for address)
 * - purpose (for purpose)  
 * - age (for age)
 * - issued_date or date (for issue date)
 * - signature_name or applicant_signature (for signature line)
 * - gender (for gender)
 * - contact (for contact number)
 * - birthdate (for birthdate)
 * 
 * Instructions:
 * 1. Create your certificate design in a word processor or design tool
 * 2. Export/save as PDF
 * 3. Open in Adobe Acrobat or online PDF editor
 * 4. Add text form fields where you want the data to appear
 * 5. Name the fields using the names above
 * 6. Save the PDF and place it at /public/indigency_template.pdf
 * 
 * Alternative: You can also create the PDF programmatically using pdf-lib:
 */

import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';

async function createSampleTemplate() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const form = pdfDoc.getForm();

  // Add some static text
  const { width, height } = page.getSize();
  page.drawText('CERTIFICATE OF INDIGENCY', {
    x: 50,
    y: height - 100,
    size: 20,
    color: rgb(0, 0, 0),
  });

  page.drawText('This is to certify that', {
    x: 50,
    y: height - 150,
    size: 12,
    color: rgb(0, 0, 0),
  });

  // Add form fields
  const nameField = form.createTextField('applicant_name');
  nameField.addToPage(page, { x: 200, y: height - 155, width: 200, height: 20 });

  const addressField = form.createTextField('applicant_address');
  addressField.addToPage(page, { x: 200, y: height - 200, width: 300, height: 20 });

  const purposeField = form.createTextField('purpose');
  purposeField.addToPage(page, { x: 200, y: height - 300, width: 200, height: 20 });

  const dateField = form.createTextField('issued_date');
  dateField.addToPage(page, { x: 400, y: height - 600, width: 150, height: 20 });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('./public/indigency_template.pdf', pdfBytes);
  console.log('Sample PDF template created at ./public/indigency_template.pdf');
}

// Uncomment to run:
// createSampleTemplate().catch(console.error);