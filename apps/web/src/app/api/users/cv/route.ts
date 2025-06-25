import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

// Get a list of ALL generated CVs for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const generatedCvs = await prisma.generatedCv.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc', 
      },
      select: {
          id: true,
          fileName: true,
          createdAt: true,
          template: true
      }
    });

    return NextResponse.json(generatedCvs);
    
  } catch (error) {
    console.error("Error fetching generated CVs:", error);
    return NextResponse.json({ error: 'Failed to fetch CV list' }, { status: 500 });
  }
}