import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Verify if the requested user ID matches the authenticated user's ID
    if (session.user.id !== params.id) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    // Get the company associated with the user
    const userWithCompany = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        company: true,
      },
    });

    if (!userWithCompany || !userWithCompany.company) {
      return new NextResponse(JSON.stringify({ error: 'Company not found' }), {
        status: 404,
      });
    }

    return new NextResponse(JSON.stringify(userWithCompany.company));
  } catch (error) {
    console.error('Error fetching company data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}