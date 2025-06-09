import { Request, Response } from "express";
import { buildCvPdfService } from "../services/cv.service";

export class CvController {
  static async generateCV(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore: requireAuth middleware has set `req.userId`
      const userId = (req as any).userId as string;
      const { extraText } = req.body as { extraText?: string };

      // Delegate all fetching + PDF construction + filename logic to the service
      const { doc, fileName } = await buildCvPdfService(userId, extraText);

      // Set headers and pipe
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      doc.pipe(res);
      doc.end();
    } catch (err: any) {
      console.error("CV generation error:", err);
      if (err.message === "User not found") {
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(500).json({ message: "Failed to generate CV" });
      }
    }
  }
}
