import PDFDocument from "pdfkit";
import prisma from "../lib/prisma";

export interface BuiltCv {
  doc: PDFKit.PDFDocument;
  fileName: string;
}

export async function buildCvPdfService(
  userId: string,
  extraText?: string
): Promise<BuiltCv> {
  // 1) Load the user (throw if not found)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true /* …other fields you need in CV… */ },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const { firstName, lastName } = user;

  // 2) Create a PDFDocument and fill it in
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  // e.g.:
  doc.fontSize(20).text(`${firstName} ${lastName}`, { align: "center" });
  doc.moveDown();

  // Add whatever CV sections you need, pulling in from DB via prisma…
  // For example:
  // const experiences = await prisma.experience.findMany({ where: { userId } });
  // experiences.forEach(exp => { /* render each */ });

  // If the caller passed extraText, append it
  if (extraText) {
    doc.addPage();
    doc.fontSize(14).text("Additional Information", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(extraText);
  }

  // Note: we do NOT doc.end() here—that’s up to the controller to pipe & end

  // 3) Build a filename
  const safeFirst = firstName.replace(/\s+/g, "_");
  const safeLast = lastName.replace(/\s+/g, "_");
  const fileName = `CV-${safeFirst}-${safeLast}.pdf`;

  return { doc, fileName };
}
