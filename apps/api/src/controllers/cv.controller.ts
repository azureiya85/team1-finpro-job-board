import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import prisma from "../lib/prisma";

export async function generateCV(req: Request, res: Response): Promise<void> {
  try {
    // @ts-ignore: userId was attached by requireAuth middleware
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // extraText may be sent in the request body
    const { extraText } = req.body;

    // Set headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CV-${user.firstName || ""}-${
        user.lastName || ""
      }.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res); // Stream PDF directly to the response

    // Header: Name centered
    doc.fontSize(20).text(`${user.firstName || ""} ${user.lastName || ""}`, {
      align: "center",
    });
    doc.moveDown();

    // Email
    doc.fontSize(12).text(`Email: ${user.email}`);
    doc.moveDown();

    // Optional extra text section
    if (extraText) {
      doc.fontSize(14).text("Additional Information:", { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(12)
        .text(extraText, { align: "left", lineGap: 4 })
        .moveDown();
    }

    // (Optionally, add more sections here—education, experience, etc.)

    doc.end();
  } catch (err) {
    console.error("CV generation error:", err);
    res.status(500).json({ message: "Failed to generate CV" });
  }
}
