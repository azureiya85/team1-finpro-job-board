import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { z } from 'zod';

// --- Step 1: validate incoming payload ---
const CvInputSchema = z.object({
  extraFields: z.record(z.string(), z.string()), 
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parse = CvInputSchema.safeParse(await request.json());
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parse.error.format() },
      { status: 400 }
    );
  }
  const { extraFields } = parse.data;
  const userId = session.user.id;

  // --- Step 2: fetch user profile from DB ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      currentAddress: true,
      lastEducation: true,
      
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // --- Step 3: generate PDF using pdf-lib ---
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 portrait
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  let y = 800;
  const { firstName, lastName, email, phoneNumber, currentAddress, lastEducation } = user;
  page.drawText(`${firstName || ''} ${lastName || ''}`, {
    x: 50,
    y,
    size: 24,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });

  y -= 30;
  page.drawText(`Email: ${email}`, { x: 50, y, size: 12, font: timesRomanFont });
  y -= 15;
  page.drawText(`Phone: ${phoneNumber || '-'}`, { x: 50, y, size: 12, font: timesRomanFont });
  y -= 15;
  page.drawText(`Address: ${currentAddress || '-'}`, {
    x: 50,
    y,
    size: 12,
    font: timesRomanFont,
  });
  y -= 25;
  page.drawText(`Education: ${lastEducation || '-'}`, {
    x: 50,
    y,
    size: 12,
    font: timesRomanFont,
  });

  // Render extra fields
  for (const [label, value] of Object.entries(extraFields)) {
    y -= 20;
    page.drawText(`${label}: ${value}`, { x: 50, y, size: 12, font: timesRomanFont });
  }

  // --- Step 4: save PDF and persist URL ---
  const pdfBytes = await pdfDoc.save();
  const filename = `cv_${userId}_${Date.now()}.pdf`;
  // For demo purposes: serve directly as base64
  const base64 = Buffer.from(pdfBytes).toString('base64');
  const url = `data:application/pdf;base64,${base64}`;

  // Optionally: store a record in DB if you track generated CVs
  await prisma.user.update({
    where: { id: userId },
    data: { /* e.g. lastCvUrl: url */ },
  });

  return NextResponse.json(
    { message: 'CV generated', url },
    { headers: { 'Content-Type': 'application/json' } }
  );
}
