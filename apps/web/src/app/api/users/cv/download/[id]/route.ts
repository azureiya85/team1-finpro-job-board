import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: { id: string };
}

// Streams a specific CV PDF for download
export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    // 1. Find the CV record and verify the user owns it
    const cvRecord = await prisma.generatedCv.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!cvRecord) {
      return NextResponse.json({ error: 'CV not found or you do not have permission to access it.' }, { status: 404 });
    }

    // 2. Fetch the PDF from the stored Cloudinary URL
    const response = await fetch(cvRecord.url);

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF from cloud storage. Status: ${response.status}`);
    }

    // 3. Get the PDF content as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();

    // 4. Create the response with correct headers to trigger a download
    const headers = new Headers();
    headers.append('Content-Type', 'application/pdf');
    headers.append(
      'Content-Disposition',
      `attachment; filename="${cvRecord.fileName || `cv_${cvRecord.id}.pdf`}"`
    );

    return new NextResponse(pdfBuffer, {
        status: 200,
        headers: headers,
    });

  } catch (error) {
    console.error("Error downloading CV:", error);
    return NextResponse.json({ error: 'Failed to download CV' }, { status: 500 });
  }
}