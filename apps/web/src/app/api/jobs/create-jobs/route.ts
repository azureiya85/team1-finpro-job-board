import { NextRequest, NextResponse } from 'next/server';
import { createJobSchema } from '@/lib/validations/zodJobValidation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    // Periksa autentikasi menggunakan auth() dari @/auth
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil data dari request body
    const data = await request.json();

    // Validasi data menggunakan Zod schema
    const validationResult = createJobSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid job data',
        details: validationResult.error.format()
      }, { status: 400 });
    }

    // Dapatkan company ID dari user yang terautentikasi
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    });

    if (!user?.company) {
      return NextResponse.json({ error: 'User is not associated with a company' }, { status: 403 });
    }

    // Buat job posting baru menggunakan prisma.jobPosting.create
    const job = await prisma.jobPosting.create({
      data: {
        ...validationResult.data,
        companyId: user.company.id,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('[API_JOBS_POST] Error creating job:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}