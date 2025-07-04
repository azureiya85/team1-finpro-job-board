import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateCompanyAccess } from '@/lib/actions/companyAuth';
import { updateCompanySchema } from '@/lib/validations/zodCompanyValidation';
import { getCompanyDetails } from '@/lib/actions/companyUtils'; 

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const companyWithStats = await getCompanyDetails(id);

    if (!companyWithStats) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(companyWithStats);

  } catch (error) {
    console.error('[API_GET_COMPANY] Error fetching company:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Validate company admin access
    const authResult = await validateCompanyAccess(id);
    
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!authResult.isCompanyAdmin || !authResult.isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized. Only company administrators can update company information.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateCompanySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid input data',
        details: validationResult.error.format(),
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Remove empty strings and convert them to null for optional fields
    const processedData = Object.fromEntries(
      Object.entries(updateData).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: { id: true, adminId: true }
    });

    if (!existingCompany) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Double-check ownership (redundant but safe)
    if (existingCompany.adminId !== authResult.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only update your own company.' },
        { status: 403 }
      );
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        ...processedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        banner: true,
        website: true,
        logo: true,
        industry: true,
        size: true,
        foundedYear: true,
        email: true,
        phone: true,
        address: true,
        latitude: true,
        longitude: true,
        provinceId: true,
        cityId: true,
        country: true,
        linkedinUrl: true,
        facebookUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        adminId: true,
        createdAt: true,
        updatedAt: true,
        province: { 
          select: { id: true, name: true, code: true } 
        },
        city: { 
          select: { id: true, name: true, type: true } 
        },
        admin: { 
          select: { id: true, name: true, email: true, profileImage: true } 
        },
      },
    });

    return NextResponse.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}