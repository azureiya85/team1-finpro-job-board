import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { SubscriptionStatus } from '@prisma/client';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        endDate: {
          gt: new Date(), // Ensure it's not expired
        },
      },
      include: {
        plan: true, // Include plan details
      },
      orderBy: {
        createdAt: 'desc', // Get the latest active one if multiple somehow exist
      }
    });

    if (activeSubscription) {
      return NextResponse.json(activeSubscription);
    }

    // Find the latest pending or expired if no active one
    const latestSubscription = await prisma.subscription.findFirst({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' }
    });
    
    if (latestSubscription) {
        return NextResponse.json(latestSubscription); 
    }

    return NextResponse.json({ message: "No subscription found for this user." }, { status: 404 });

  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch user subscription' }, { status: 500 });
  }
}