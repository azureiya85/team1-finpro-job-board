import prisma from '@/lib/prisma';
import { subDays } from 'date-fns';

export async function getAnalyticsSummary() {
  const today = new Date();
  const yesterday = subDays(today, 1);

  const [current, previous] = await Promise.all([
    prisma.websiteAnalytics.findFirst({
      where: { date: today },
    }),
    prisma.websiteAnalytics.findFirst({
      where: { date: yesterday },
    }),
  ]);

  return { current, previous };
}
