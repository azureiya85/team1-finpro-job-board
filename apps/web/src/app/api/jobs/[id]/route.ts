import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { JobPostingFeatured } from '@/types'; 
import { auth } from '@/auth';
import { createJobSchema } from '@/lib/validations/zodJobValidation';


export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const job = await prisma.jobPosting.findUnique({
      where: {
        id: id,
        isActive: true, // Only fetch active jobs
      },
      select: {
        id: true,
        title: true,
        description: true,
        employmentType: true,
        experienceLevel: true,
        category: true,
        isRemote: true,
        createdAt: true,
        publishedAt: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        isPriority: true,
        tags: true,
        requirements: true,
        benefits: true,
        applicationDeadline: true,
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            size: true,
            description: true,
          },
        },
        city: {
          select: {
            id: true,
            name: true,
          },
        },
        province: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job as unknown as JobPostingFeatured, { status: 200 });

  } catch (error) {
    console.error('API: Failed to fetch job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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