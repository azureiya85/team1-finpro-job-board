import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
// import { generatePdfForCertificate } from '@/lib/pdfGenerator'; // TODO: PDF generator

interface RouteContext {
  params: Promise<{ id: string }>; 
}

// Download Certificate (User Only)
export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: certificateCode } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateCode: certificateCode,
        userId: session.user.id, 
        isValid: true
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found, not valid, or does not belong to you.' }, { status: 404 });
    }

    // TODO: Implement actual PDF generation and streaming
    if (certificate.certificateUrl) {
        return NextResponse.json({ message: "PDF download endpoint placeholder. Implement actual PDF serving.", url: certificate.certificateUrl });
    }

    return NextResponse.json({ error: 'Certificate file not available.' }, { status: 500 });

  } catch (error) {
    console.error("Error downloading certificate:", error);
    return NextResponse.json({ error: 'Failed to download certificate' }, { status: 500 });
  }
}