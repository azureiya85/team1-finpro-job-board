 
import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; 
import { auth } from '@/auth'; 

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: {
        price: 'asc', 
      },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}