import { NextRequest, NextResponse } from 'next/server';
import { createJobSchema } from '@/lib/validations/zodJobValidation';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Job Creation API Started ===');
    
    // Periksa autentikasi menggunakan auth() dari @/auth
    const session = await auth();
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (!session) {
      console.log('Unauthorized: No session found');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'No valid session found' 
      }, { status: 401 });
    }

    // Ambil data dari request body
    const data = await request.json();

    // Validasi data menggunakan Zod schema
    const validationResult = createJobSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid job data',
        message: 'Validation failed',
        details: validationResult.error.format(),
        issues: validationResult.error.issues
      }, { status: 400 });
    }


    // Dapatkan company ID dari user yang terautentikasi
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true }
    });

    if (!user?.company) {
      console.log('User is not associated with a company');
      return NextResponse.json({ 
        error: 'User is not associated with a company',
        message: 'Please ensure your account is linked to a company profile'
      }, { status: 403 });
    }

    // Siapkan data untuk dibuat
    const jobData = {
      ...validationResult.data,
      companyId: user.company.id,
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };


    // Buat job posting baru menggunakan prisma.jobPosting.create
    const job = await prisma.jobPosting.create({
      data: jobData
    });

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: job
    }, { status: 201 });

  } catch (error) {
    console.error('[API_JOBS_POST] Detailed Error:', error);
    
    // Handle Prisma-specific errors
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Handle Prisma validation errors
      if (error.message.includes('Prisma')) {
        return NextResponse.json({
          error: 'Database error',
          message: 'Failed to save job to database',
          details: error.message
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while creating the job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}