import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJobById } from '@/lib/jobsUtils';
import { auth } from '@/auth';
import { createJobSchema } from '@/lib/validations/zodJobValidation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note: params is a Promise
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error(`[API_GET_JOB_BY_ID] Failed to fetch job ${id}:`, error);
    return NextResponse.json(
      { error: 'An internal error occurred while fetching the job.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Periksa autentikasi
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

    // Periksa apakah job posting ada dan milik company yang sama
    const existingJob = await prisma.jobPosting.findUnique({
      where: { id }
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job posting not found' }, { status: 404 });
    }

    if (existingJob.companyId !== user.company.id) {
      return NextResponse.json({ error: 'Unauthorized to edit this job posting' }, { status: 403 });
    }

    // Update job posting
    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: {
        ...validationResult.data,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('[API_JOBS_PUT] Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}