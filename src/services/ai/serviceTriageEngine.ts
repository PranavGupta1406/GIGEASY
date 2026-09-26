// GigEasy AI Service Triage Engine
// Classifies customer service requests using keyword/pattern matching with confidence scoring.
// Clearly labeled as AI-assisted, not guaranteed diagnosis.

import { AIServiceClassification, UrgencyLevel, SkillCategory, ServicePriceEstimate } from '../../types';

interface TriageRule {
  keywords: string[];
  serviceType: SkillCategory;
  suggestedSkills: string[];
  urgencyBoost?: boolean;        // True if keywords suggest emergency
  estimatedDurationHours: number;
  requiredParts?: string[];
}

const TRIAGE_RULES: TriageRule[] = [
  // Plumbing
  {
    keywords: ['leak', 'leaking', 'pipe', 'tap', 'faucet', 'drain', 'clog', 'overflow', 'water', 'sewage', 'toilet', 'flush', 'blockage', 'burst', 'flood'],
    serviceType: 'Plumbing',
    suggestedSkills: ['Home Plumber', 'Plumber'],
    estimatedDurationHours: 2,
    requiredParts: ['Pipe fittings', 'PTFE tape', 'Washers'],
  },
  {
    keywords: ['pipe burst', 'burst pipe', 'flooding', 'water everywhere', 'emergency plumbing'],
    serviceType: 'Plumbing',
    suggestedSkills: ['Home Plumber', 'Plumber'],
    urgencyBoost: true,
    estimatedDurationHours: 3,
  },
  // Electrical
  {
    keywords: ['electric', 'electrical', 'short circuit', 'tripping', 'mcb', 'socket', 'switch', 'fan', 'light', 'wiring', 'power', 'voltage', 'shock'],
    serviceType: 'Electrical',
    suggestedSkills: ['Home Electrician', 'Electrician'],
    estimatedDurationHours: 2,
  },
  {
    keywords: ['spark', 'sparking', 'fire', 'burning smell', 'smoke from socket', 'no power', 'blackout'],
    serviceType: 'Electrical',
    suggestedSkills: ['Home Electrician', 'Electrician'],
    urgencyBoost: true,
    estimatedDurationHours: 2,
  },
  // Carpentry
  {
    keywords: ['door', 'window', 'lock', 'hinge', 'furniture', 'cabinet', 'shelf', 'wooden', 'carpenter', 'wood', 'wardrobe', 'drawer'],
    serviceType: 'Carpentry',
    suggestedSkills: ['Home Carpenter', 'Carpenter'],
    estimatedDurationHours: 3,
  },
  // Painting
  {
    keywords: ['paint', 'painting', 'wall', 'colour', 'color', 'coat', 'polish', 'waterproof', 'crack', 'damp'],
    serviceType: 'Painting',
    suggestedSkills: ['Home Painter', 'Painter'],
    estimatedDurationHours: 6,
  },
  // Cleaning
  {
    keywords: ['clean', 'cleaning', 'sweep', 'mop', 'dust', 'scrub', 'bathroom clean', 'kitchen clean', 'sofa clean', 'carpet'],
    serviceType: 'Cleaning',
    suggestedSkills: ['Deep Cleaning Expert', 'Housekeeping Staff'],
    estimatedDurationHours: 4,
  },
  // Domestic Help
  {
    keywords: ['maid', 'cook', 'cooking', 'washing', 'laundry', 'utensils', 'bai', 'helper', 'daily help', 'household'],
    serviceType: 'Domestic Help',
    suggestedSkills: ['Domestic Help', 'Cook / Chef'],
    estimatedDurationHours: 4,
  },
  // Caregiving
  {
    keywords: ['elder', 'elderly', 'old person', 'patient', 'care', 'nurse', 'medical', 'surgery', 'recovery', 'bedridden', 'baby', 'infant', 'nanny', 'child care'],
    serviceType: 'Caregiving',
    suggestedSkills: ['Caregiver / Elder Care', 'Baby Care / Nanny'],
    estimatedDurationHours: 8,
  },
  // Appliance Repair
  {
    keywords: ['ac', 'air conditioner', 'fridge', 'refrigerator', 'washing machine', 'tv', 'geyser', 'microwave', 'oven', 'repair', 'not working', 'broken'],
    serviceType: 'Appliance Repair',
    suggestedSkills: ['Appliance Technician', 'AC Technician'],
    estimatedDurationHours: 2,
    requiredParts: ['Spare parts (if needed)'],
  },
  // Gardening
  {
    keywords: ['garden', 'plant', 'grass', 'lawn', 'tree', 'pruning', 'mowing', 'flower', 'pot', 'soil'],
    serviceType: 'Gardening',
    suggestedSkills: ['Gardener / Landscaper'],
    estimatedDurationHours: 3,
  },
  // Driving
  {
    keywords: ['driver', 'drive', 'pickup', 'airport', 'outstation', 'drop', 'car'],
    serviceType: 'Driving',
    suggestedSkills: ['Personal Driver'],
    estimatedDurationHours: 4,
  },
  // Pest Control
  {
    keywords: ['pest', 'cockroach', 'rat', 'mouse', 'termite', 'ant', 'mosquito', 'fumigation', 'spray', 'insects'],
    serviceType: 'Pest Control',
    suggestedSkills: ['Pest Control'],
    estimatedDurationHours: 2,
  },
];

const EMERGENCY_KEYWORDS = [
  'emergency', 'urgent', 'immediately', 'asap', 'right now', 'flooding', 'fire', 'spark', 'shock',
  'burst', 'dangerous', 'critical', 'help', 'quickly', 'fast', 'जरूरी', 'तुरंत',
];

const HIGH_URGENCY_KEYWORDS = [
  'not working', 'broken', 'completely', 'totally', 'heavy leak', 'no water', 'no power',
  'all rooms', 'smell gas', 'gas leak',
];

/**
 * Classify a service request using multi-pattern keyword matching.
 * Returns confidence score and human-readable reasoning.
 */
export function classifyServiceRequest(description: string): AIServiceClassification {
  const lowerDesc = description.toLowerCase();

  // Score each rule by keyword matches
  const scores = TRIAGE_RULES.map((rule) => {
    const matchCount = rule.keywords.filter((kw) => lowerDesc.includes(kw.toLowerCase())).length;
    const matchedKeywords = rule.keywords.filter((kw) => lowerDesc.includes(kw.toLowerCase()));
    return {
      rule,
      matchCount,
      matchedKeywords,
      score: matchCount / rule.keywords.length,
    };
  });

  // Sort by match count descending
  scores.sort((a, b) => b.matchCount - a.matchCount || b.score - a.score);

  const best = scores[0];

  // If no matches, return general helper classification
  if (!best || best.matchCount === 0) {
    return {
      serviceType: 'Helper',
      suggestedSkills: ['Helper'],
      urgencyLevel: 'medium',
      estimatedDurationHours: 2,
      confidence: 0.3,
      reasoning: 'Unable to classify service type from description. Please provide more details or select a category manually.',
    };
  }

  // Determine urgency
  const hasEmergencyKeyword = EMERGENCY_KEYWORDS.some((kw) => lowerDesc.includes(kw));
  const hasHighUrgency = HIGH_URGENCY_KEYWORDS.some((kw) => lowerDesc.includes(kw));
  const hasUrgencyBoost = best.rule.urgencyBoost;

  let urgencyLevel: UrgencyLevel = 'medium';
  if (hasEmergencyKeyword || hasUrgencyBoost) {
    urgencyLevel = 'emergency';
  } else if (hasHighUrgency) {
    urgencyLevel = 'high';
  } else if (best.matchCount >= 3) {
    urgencyLevel = 'medium';
  } else {
    urgencyLevel = 'low';
  }

  // Calculate confidence
  const rawConfidence = Math.min(0.95, 0.4 + best.matchCount * 0.12 + best.score * 0.3);
  const confidence = Number(rawConfidence.toFixed(2));

  // Generate reasoning
  const matchedStr = best.matchedKeywords.slice(0, 3).join(', ');
  let reasoning = `Identified as ${best.rule.serviceType} service based on keywords: "${matchedStr}".`;
  if (hasEmergencyKeyword) {
    reasoning += ' Emergency keywords detected — marking as urgent.';
  }
  if (best.rule.requiredParts && best.rule.requiredParts.length > 0) {
    reasoning += ` Possible parts needed: ${best.rule.requiredParts.join(', ')}.`;
  }
  reasoning += ' AI-assisted classification — final confirmation by assigned worker.';

  return {
    serviceType: best.rule.serviceType,
    suggestedSkills: best.rule.suggestedSkills,
    urgencyLevel,
    estimatedDurationHours: best.rule.estimatedDurationHours,
    requiredParts: best.rule.requiredParts,
    confidence,
    reasoning,
  };
}

/**
 * Generate a price estimate for a service request.
 */
export function estimateServicePrice(
  serviceCategory: string,
  urgency: UrgencyLevel,
  estimatedDurationHours: number
): ServicePriceEstimate {
  const basePrices: Record<string, number> = {
    'Plumbing': 350,
    'Electrical': 400,
    'Carpentry': 500,
    'Painting': 600,
    'Cleaning': 300,
    'Domestic Help': 300,
    'Caregiving': 400,
    'Driving': 300,
    'Gardening': 350,
    'Appliance Repair': 450,
    'Pest Control': 600,
  };

  const basePrice = basePrices[serviceCategory] ?? 400;
  const urgencyMultiplier = urgency === 'emergency' ? 1.5 : urgency === 'high' ? 1.2 : 1.0;
  const durationCost = basePrice * (estimatedDurationHours - 1) * 0.5;
  const materialsCost = serviceCategory === 'Plumbing' ? 80 : serviceCategory === 'Electrical' ? 60 : 0;
  const travelCost = 30;

  const totalEstimate = Math.round((basePrice * urgencyMultiplier) + durationCost + materialsCost + travelCost);
  const rangeMin = Math.round(totalEstimate * 0.8);
  const rangeMax = Math.round(totalEstimate * 1.3);

  const breakdown = {
    totalAmount: totalEstimate,
    workerEarning: Math.round(totalEstimate * 0.82),
    cooperativeContribution: Math.round(totalEstimate * 0.08),
    welfareContribution: Math.round(totalEstimate * 0.05),
    platformFee: Math.round(totalEstimate * 0.05),
    workerEarningPct: 82,
    cooperativePct: 8,
    welfarePct: 5,
    platformFeePct: 5,
  };

  return {
    basePrice,
    complexityMultiplier: urgencyMultiplier,
    durationEstimateHours: estimatedDurationHours,
    materialsCost,
    travelCost,
    totalEstimate,
    rangeMin,
    rangeMax,
    breakdown,
  };
}
