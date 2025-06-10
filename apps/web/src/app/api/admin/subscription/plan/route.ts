import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
import { auth } from '@/auth';
import { CreateSubscriptionPlanSchema, CreateSubscriptionPlanInput } from '@/lib/validations/zodSubscriptionValidation';
import { UserRole } from '@prisma/client';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  let rawBody;
  try {
    rawBody = await request.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = CreateSubscriptionPlanSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
  }

  const data: CreateSubscriptionPlanInput = validation.data;

  try {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
        where: { name: data.name }
    });
    if (existingPlan) {
        return NextResponse.json({ error: `Plan with name '${data.name}' already exists.` }, { status: 409 });
    }

    const newPlan = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        features: data.features, // Prisma will handle JSON serialization
      },
    });
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return NextResponse.json({ error: 'Failed to create subscription plan' }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription plans' }, { status: 500 });
  }
}