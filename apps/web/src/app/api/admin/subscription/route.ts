import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UserRole, SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const status = searchParams.get('status') as SubscriptionStatus | null;
  const paymentStatus = searchParams.get('paymentStatus') as PaymentStatus | null;
  const userId = searchParams.get('userId');
  const planId = searchParams.get('planId');

  const skip = (page - 1) * limit;

  // Use Prisma's type-safe where clause
  const whereClause: Prisma.SubscriptionWhereInput = {};
  
  if (status && Object.values(SubscriptionStatus).includes(status)) {
    whereClause.status = status;
  }
  if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
    whereClause.paymentStatus = paymentStatus;
  }
  if (userId) {
    whereClause.userId = userId;
  }
  if (planId) {
    whereClause.planId = planId;
  }
  
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: {
          select: {
            id: true,
            name: true,
            price: true, 
            duration: true,
            features: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalSubscriptions = await prisma.subscription.count({ where: whereClause });

    return NextResponse.json({
      data: subscriptions,
      meta: {
        total: totalSubscriptions,
        page,
        limit,
        totalPages: Math.ceil(totalSubscriptions / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching subscriptions for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}