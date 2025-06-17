import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { generateCertificatePdf } from '@/lib/server/pdfGenerator';
import { uploadFileToCloudinary } from '@/lib/cloudinary';

interface RouteContext {
  params: Promise<{ id: string }>; // Updated to Promise in Next.js 15
}

// Generate and upload certificate PDF
export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const certificateCode = id;

    // 1. Find the certificate and verify ownership
    const certificate = await prisma.certificate.findUnique({
      where: {
        certificateCode: certificateCode,
        userId: session.user.id, // Ensures only the owner can generate it
      },
      include: {
        user: { select: { name: true, email: true } },
        userAssessment: {
          select: {
            assessment: { select: { title: true } },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found or you do not have permission.' }, { status: 404 });
    }

    // 2. Check if the PDF URL already exists and is not a placeholder
    if (certificate.certificateUrl && !certificate.certificateUrl.includes('placeholder')) {
      return NextResponse.json({ url: certificate.certificateUrl });
    }

    // 3. Prepare data for the PDF template
    const templateProps = {
      userName: certificate.user.name || certificate.user.email || 'Valued User',
      assessmentTitle: certificate.userAssessment.assessment.title,
      issueDate: certificate.issueDate.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      }),
      certificateCode: certificate.certificateCode,
    };

    // 4. Generate the PDF buffer
    const pdfBuffer = await generateCertificatePdf(templateProps);

    // 5. Upload the PDF to Cloudinary
    const publicId = `job-portal/certificates/${certificate.certificateCode}`;
    const uploadResult = await uploadFileToCloudinary(pdfBuffer, publicId);

    if (!uploadResult?.secure_url) {
      throw new Error('Failed to upload certificate to Cloudinary.');
    }

    // 6. Update the certificate record with the final URL
    const updatedCertificate = await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        certificateUrl: uploadResult.secure_url,
      },
    });

    // 7. Return the final URL
    return NextResponse.json({ url: updatedCertificate.certificateUrl });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}