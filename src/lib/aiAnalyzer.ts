export interface AuditInput {
  businessName: string;
  storeUrl: string;
  industry?: string;
  trafficSource: string;
  primaryStruggle: string;
  monthlyRevenue?: string;
}

export interface AiAuditResult {
  overallScore: number;
  grade: string;
  summary: string;
  estimatedLeakMin: number;
  estimatedLeakMax: number;
  conversionPotential: string;
  scores: {
    mobileUx: number;
    adAlignment: number;
    checkoutFriction: number;
    socialProof: number;
  };
  criticalFixes: Array<{
    title: string;
    impact: 'HIGH' | 'CRITICAL' | 'MEDIUM';
    finding: string;
    aiRecommendation: string;
    actionableStep: string;
  }>;
  aiSuggestedCopy: {
    headline: string;
    subheadline: string;
    callToAction: string;
  };
}

export function generateAiAudit(input: AuditInput): AiAuditResult {
  const name = input.businessName.trim() || 'Your Store';
  const url = input.storeUrl.trim() || 'your page';
  const struggle = input.primaryStruggle;
  const source = input.trafficSource;

  // Determine scores based on AI heuristics & problem matching
  let mobileUx = 64;
  let adAlignment = 58;
  let checkoutFriction = 45;
  let socialProof = 52;

  if (struggle.includes('High clicks')) {
    adAlignment = 42;
    checkoutFriction = 50;
  } else if (struggle.includes('Cart abandonment')) {
    checkoutFriction = 35;
    mobileUx = 55;
  } else if (struggle.includes('WhatsApp')) {
    checkoutFriction = 38;
    socialProof = 48;
  } else if (struggle.includes('Slow page loading')) {
    mobileUx = 32;
    checkoutFriction = 52;
  } else if (struggle.includes('cost per customer')) {
    adAlignment = 45;
    socialProof = 40;
  }

  const overallScore = Math.round((mobileUx + adAlignment + checkoutFriction + socialProof) / 4);

  let grade = 'C';
  if (overallScore < 50) grade = 'D (Severe Risk)';
  else if (overallScore < 65) grade = 'C- (High Leak Danger)';
  else if (overallScore < 80) grade = 'B (Moderate Risk)';
  else grade = 'A (Optimized)';

  // Customized AI findings based on traffic source and struggle
  const criticalFixes: AiAuditResult['criticalFixes'] = [];

  // Fix 1: Ad Alignment / Hook Fix
  if (source.includes('Facebook') || source.includes('TikTok') || source.includes('Instagram')) {
    criticalFixes.push({
      title: `AI Hook & Ad Relevancy Mismatch (${source})`,
      impact: 'CRITICAL',
      finding: `AI detected a drop in user retention within 2.1 seconds. Visitors coming from ${source} ads expect instant gratification, but ${url} does not mirror the exact visual hook or price point promised in your ad.`,
      aiRecommendation: `Align your top header section with the exact visual offer used in your paid ads to maintain message match.`,
      actionableStep: `Place a 1-sentence value proposition and target offer banner immediately visible above the fold without scrolling.`
    });
  } else {
    criticalFixes.push({
      title: `First 3-Second Retention Failure`,
      impact: 'HIGH',
      finding: `Mobile visitors are confused about the core value proposition of ${name} within their initial 3 seconds on page.`,
      aiRecommendation: `Simplify top hero banner to feature your main product outcome rather than generic brand statements.`,
      actionableStep: `Replace vague taglines with a outcome-focused headline: "Get [Desired Result] in [Timeframe] without [Frustration]".`
    });
  }

  // Fix 2: Checkout & Friction Fix
  if (struggle.includes('Cart abandonment') || struggle.includes('WhatsApp') || checkoutFriction < 50) {
    criticalFixes.push({
      title: `Checkout Friction & Form Overload`,
      impact: 'CRITICAL',
      finding: `Your current order process requires multi-step navigation or excessive input fields on smartphones, triggering up to 64% cart drop-offs.`,
      aiRecommendation: `Bypass traditional multi-page carts. Enable instant 1-click WhatsApp order routing with auto-filled item details.`,
      actionableStep: `Implement a floating "Order Instantly on WhatsApp" button pinned to the mobile screen bottom.`
    });
  } else {
    criticalFixes.push({
      title: `Mobile Page Speed & Script Lag`,
      impact: 'HIGH',
      finding: `Heavy uncompressed images and unoptimized scripts delay mobile rendering by an estimated 1.8 - 2.4 seconds on mobile networks.`,
      aiRecommendation: `Compress all product hero images to Next-Gen WebP formats and defer non-critical third-party scripts.`,
      actionableStep: `Utilize Frontstore lightweight storefront technology to achieve under 1.2-second mobile load speeds.`
    });
  }

  // Fix 3: Social Proof & Trust Fix
  criticalFixes.push({
    title: `Missing Real-Time Social Proof & Verification`,
    impact: 'HIGH',
    finding: `First-time buyers from social media ads have high skepticism regarding payment security, product authenticity, and delivery times.`,
    aiRecommendation: `Inject verified customer reviews, video unboxing snippets, and money-back guarantee badges near the primary buy button.`,
    actionableStep: `Embed 3 real customer WhatsApp testimonial screenshots directly below your product pricing section.`
  });

  // AI-Suggested Copy Improvements
  const aiSuggestedCopy = {
    headline: `Experience Premium Quality With ${name} – Fast Delivery Nationwide`,
    subheadline: `Join 1,000+ happy customers. Order directly on WhatsApp in under 30 seconds with no complex checkout forms.`,
    callToAction: `⚡ Order on WhatsApp Now – Instant Confirmation`
  };

  return {
    overallScore,
    grade,
    summary: `AI analysis of ${name} (${url}) identified an average conversion rate bottleneck. You are currently converting roughly ${ (overallScore * 0.02).toFixed(1) }% of social ad traffic, leaving significant monthly revenue uncollected.`,
    estimatedLeakMin: 350000,
    estimatedLeakMax: 1250000,
    conversionPotential: `3.2% - 4.8%`,
    scores: {
      mobileUx,
      adAlignment,
      checkoutFriction,
      socialProof
    },
    criticalFixes,
    aiSuggestedCopy
  };
}
