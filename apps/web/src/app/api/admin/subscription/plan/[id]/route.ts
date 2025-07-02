import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { UpdateSubscriptionPlanSchema, UpdateSubscriptionPlanInput, convertLegacyFeatures } from '@/lib/validations/zodSubscriptionValidation';
import { UserRole } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface RouteContext {
  params: {
    planId: string;
  };
}

export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }
  const { planId } = params;
  try {
    const planFromDb = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!planFromDb) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const plan = {
      ...planFromDb,
      features: convertLegacyFeatures(planFromDb.features),
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error(`Error fetching plan ${planId}:`, error);
    return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { planId } = params;
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch (error) {
    console.error('JSON parsing error:', error);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  
  const validation = UpdateSubscriptionPlanSchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid input', details: validation.error.formErrors }, { status: 400 });
  }

  const data: UpdateSubscriptionPlanInput = validation.data;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (data.name && data.name !== plan.name) {
        const existingPlan = await prisma.subscriptionPlan.findUnique({
            where: { name: data.name }
        });
        if (existingPlan) {
            return NextResponse.json({ error: `Plan with name '${data.name}' already exists.` }, { status: 409 });
        }
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        features: data.features,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error(`Error updating plan ${planId}:`, error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.Developer)) {
    return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
  }

  const { planId } = params;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({ 
        where: { id: planId },
        include: { subscriptions: true } // Check for active subscriptions
    });
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Basic check: prevent deletion if plan is actively used.
    if (plan.subscriptions.some(sub => sub.status === 'ACTIVE' && sub.endDate > new Date())) {
        return NextResponse.json({ error: 'Cannot delete plan with active user subscriptions. Consider deactivating it instead.' }, { status: 400 });
    }

    await prisma.subscriptionPlan.delete({ where: { id: planId } });
    return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 }); 
  } catch (error) {
    console.error(`Error deleting plan ${planId}:`, error);
    
    // Type-safe error handling for Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2003' || error.code === 'P2014') {
        return NextResponse.json({ 
          error: 'Cannot delete plan. It is still referenced by user subscriptions. Please ensure no subscriptions are linked to this plan.'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}