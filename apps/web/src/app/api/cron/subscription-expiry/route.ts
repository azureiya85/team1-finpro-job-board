import { NextResponse, type NextRequest } from 'next/server';
import { handleSubscriptionExpiry } from '@/services/cron/subscription-expiry.service';
import { getSubscriptionStatistics } from '@/services/cron/subscription-statistics.service';

// POST - Handle subscription expiry (called by cron)
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Starting subscription expiry cron job...');

  try {
    const result = await handleSubscriptionExpiry();
    
    // Log the results for monitoring
    console.log('Subscription expiry cron job completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription expiry handling completed successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in subscription expiry cron job:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to handle subscription expiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Get subscription expiry statistics (for monitoring/debugging)
export async function GET() {
  try {
    const statistics = await getSubscriptionStatistics();
    
    return NextResponse.json({
      statistics,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching subscription statistics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch subscription statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}