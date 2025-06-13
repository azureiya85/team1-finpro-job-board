import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; testId: string } }
  ) {
    try {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const test = await prisma.preSelectionTest.findUnique({
        where: {
          id: params.testId
        },
        include: {
          questions: true,
          jobPostings: {
            where: {
              id: params.id
            }
          }
        }
      });
  
      if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      }
  
      if (test.jobPostings.length === 0) {
        return NextResponse.json(
          { error: 'Test not associated with this job' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(test);
    } catch (error) {
      console.error('Error in GET /api/jobs/[id]/test/[testId]/detail:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test details' },
        { status: 500 }
      );
    }
  }

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; testId: string } }
  ) {
    try {
      const session = await auth();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const userWithCompany = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          company: true,
        },
      });
  
      if (!userWithCompany?.company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 });
      }
  
      // Cek apakah test ada dan milik company yang benar
      const test = await prisma.preSelectionTest.findFirst({
        where: {
          id: params.testId,
          companyId: userWithCompany.company.id
        },
        include: {
          jobPostings: true
        }
      });
  
      if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 });
      }
  
      // Verifikasi relasi dengan job
      const hasJobRelation = test.jobPostings.some(job => job.id === params.id);
      if (!hasJobRelation) {
        return NextResponse.json({ error: 'Test is not associated with this job' }, { status: 404 });
      }
  
      // Hapus relasi dengan job terlebih dahulu
      await prisma.preSelectionTest.update({
        where: { id: params.testId },
        data: {
          jobPostings: {
            disconnect: {
              id: params.id
            }
          }
        }
      });
  
      // Hapus test
      await prisma.preSelectionTest.delete({
        where: {
          id: params.testId,
        },
      });
  
      return NextResponse.json({ message: 'Test deleted successfully' });
  
    } catch (error) {
      console.error('Error deleting test:', error);
      return NextResponse.json(
        { error: 'Failed to delete test' },
        { status: 500 }
      );
    }
  }