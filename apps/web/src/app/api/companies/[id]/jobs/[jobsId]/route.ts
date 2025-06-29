import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';
import { updateJobSchema } from '@/lib/validations/zodJobValidation';
import { ProcessedJobUpdateData } from '@/types';

const prisma = new PrismaClient();
const validateAccess = async (companyId: string, requireAdmin = false) => {
  const authResult = await validateCompanyAccess(companyId);
  if (!authResult.isAuthenticated) {
    return { error: 'Authentication required', status: 401 };
  }
  if (requireAdmin && !authResult.isCompanyAdmin && !authResult.isOwner) {
    return { error: 'Unauthorized. Only company administrators or owners can perform this action.', status: 403 };
  }
  return { authResult };
};

const findJob = async (jobId: string, companyId: string, includeAdmin = false) => {
  const include = {
    company: {
      select: { id: true, name: true, logo: true, industry: true, ...(includeAdmin && { adminId: true }) }
    },
    province: { select: { id: true, name: true, code: true } },
    city: { select: { id: true, name: true, type: true } },
    preSelectionTest: {
      select: { id: true, title: true, isActive: true }
    },
    _count: { select: { applications: true } }
  };

  const job = await prisma.jobPosting.findFirst({
    where: { id: jobId, companyId },
    include
  });

  if (!job) {
    return { error: 'Job posting not found or does not belong to this company', status: 404 };
  }
  return { job };
};

export async function GET(request: NextRequest, context: { params: { id: string, jobsId: string } }) {
  try {
    const { id: companyId, jobsId } = context.params;
    const accessResult = await validateAccess(companyId);
    if ('error' in accessResult) return NextResponse.json({ error: accessResult.error }, { status: accessResult.status });

    const jobResult = await findJob(jobsId, companyId);
    if ('error' in jobResult) return NextResponse.json({ error: jobResult.error }, { status: jobResult.status });

    return NextResponse.json(jobResult.job);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string, jobsId: string } }) {
  try {
    const { id: companyId, jobsId } = context.params;
    const accessResult = await validateAccess(companyId, true);
    if ('error' in accessResult) return NextResponse.json({ error: accessResult.error }, { status: accessResult.status });

    const body = await request.json();
    const validationResult = updateJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input data', details: validationResult.error.format() }, { status: 400 });
    }

    const jobResult = await findJob(jobsId, companyId, true);
    if ('error' in jobResult) return NextResponse.json({ error: jobResult.error }, { status: jobResult.status });

    const updateData = validationResult.data;
    if (updateData.preSelectionTestId) {
      const test = await prisma.preSelectionTest.findFirst({
        where: { id: updateData.preSelectionTestId, companyId, isActive: true }
      });
      if (!test) {
        return NextResponse.json({ error: 'Pre-selection test not found or does not belong to your company' }, { status: 400 });
      }
    }

    const processedData: ProcessedJobUpdateData = {
      ...updateData,
      provinceId: updateData.provinceId === '' ? null : updateData.provinceId,
      cityId: updateData.cityId === '' ? null : updateData.cityId,
      preSelectionTestId: updateData.preSelectionTestId === '' ? null : updateData.preSelectionTestId,
      publishedAt: updateData.isActive && !jobResult.job.publishedAt ? new Date() : undefined
    };

    const updatedJob = await prisma.jobPosting.update({
      where: { id: jobsId },
      data: { ...processedData, updatedAt: new Date() },
      include: {
        company: {
          select: { id: true, name: true, logo: true, industry: true }
        },
        province: {
          select: { id: true, name: true, code: true }
        },
        city: {
          select: { id: true, name: true, type: true }
        },
        preSelectionTest: {
          select: { id: true, title: true, isActive: true }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    return NextResponse.json({ message: 'Job posting updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Error updating job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string, jobsId: string } }) {
  try {
    const { id: companyId, jobsId } = context.params;
    const accessResult = await validateAccess(companyId, true);
    if ('error' in accessResult) return NextResponse.json({ error: accessResult.error }, { status: accessResult.status });

    const jobResult = await findJob(jobsId, companyId, true);
    if ('error' in jobResult) return NextResponse.json({ error: jobResult.error }, { status: jobResult.status });

    if (jobResult.job._count.applications > 0) {
      const updatedJob = await prisma.jobPosting.update({
        where: { id: jobsId },
        data: { isActive: false, updatedAt: new Date() },
        select: { id: true, title: true, isActive: true, updatedAt: true }
      });
      return NextResponse.json({
        message: 'Job posting deactivated successfully (soft delete due to existing applications)',
        job: updatedJob
      });
    }

    await prisma.jobPosting.delete({ where: { id: jobsId } });
    return NextResponse.json({ message: 'Job posting deleted successfully', jobsId });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}