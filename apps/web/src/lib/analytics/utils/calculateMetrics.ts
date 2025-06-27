interface MetricInput {
    current: number;
    previous: number;
  }
  
  interface MetricResult {
    value: number;
    change: number;
    positive: boolean;
  }
  
  export function calculateMetric({ current, previous }: MetricInput): MetricResult {
    const change = previous > 0 ? ((current - previous) / previous) * 100 : 100;
    return {
      value: current,
      change: Math.abs(Number(change.toFixed(2))),
      positive: current >= previous,
    };
  }
  