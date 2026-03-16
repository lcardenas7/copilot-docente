// Scalability strategy for Copilot Docente

interface UserMetrics {
  dailyExams: number;
  dailyTokens: number;
  monthlyCost: number;
}

interface ScalingMetrics {
  users: number;
  dailyRequests: number;
  tokenUsage: number;
  costProjections: {
    current: number;
    with50Users: number;
    with100Users: number;
    with500Users: number;
  };
}

// Current metrics (based on logs)
export const CURRENT_METRICS: ScalingMetrics = {
  users: 1, // Current active users
  dailyRequests: 20, // Exams per day
  tokenUsage: 100000, // Daily token usage
  costProjections: {
    current: 20 * 5, // ~$20/day with current usage
    with50Users: 50 * 10 * 5, // 50 users × 10 exams × $5 = $2,500/day
    with100Users: 100 * 10 * 5, // $5,000/day
    with500Users: 500 * 10 * 5, // $25,000/day
  }
};

// Scaling strategies
export const SCALING_STRATEGIES = {
  immediate: [
    "Upgrade to Groq Dev Tier (1M tokens/day)",
    "Implement aggressive caching",
    "Optimize prompts for token efficiency"
  ],
  
  shortTerm: [
    "Add OpenAI as backup provider",
    "Implement rate limiting per user",
    "Add usage analytics dashboard"
  ],
  
  mediumTerm: [
    "Multi-provider load balancing",
    "Edge caching for common requests",
    "Batch processing for peak hours"
  ],
  
  longTerm: [
    "Fine-tune smaller models for specific tasks",
    "On-premise inference for sensitive data",
    "Hybrid cloud + edge architecture"
  ]
};

// Cost optimization
export function calculateROI(users: number, subscriptionPrice: number): number {
  const dailyCost = SCALING_STRATEGIES.immediate.length * 0.20; // $0.20 per 1K tokens
  const monthlyCost = dailyCost * 30;
  const monthlyRevenue = users * subscriptionPrice;
  
  return monthlyRevenue - monthlyCost;
}

// Recommended pricing tiers based on scaling
export const PRICING_TIERS = {
  individual: {
    price: 7, // $7/month
    examsPerMonth: 10,
    tokenLimit: 50000
  },
  
  pro: {
    price: 15, // $15/month  
    examsPerMonth: 50,
    tokenLimit: 250000
  },
  
  school: {
    price: 50, // $50/month
    examsPerMonth: 200,
    tokenLimit: 1000000,
    users: 10
  },
  
  enterprise: {
    price: 200, // $200/month
    examsPerMonth: 1000,
    tokenLimit: 5000000,
    users: 50,
    priority: true
  }
};
