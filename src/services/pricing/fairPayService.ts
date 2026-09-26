// GigEasy Fair Pay Intelligence Service
// Estimates fair compensation using trade, location, demand pressure, and historical market data.
// Real calculations, clear bounds, transparent benchmarks.

import { FairPayEstimate } from '../../types';

interface BenchmarkData {
  min: number;
  max: number;
  typical: number;
}

// City wage adjustments relative to base tier
const CITY_MULTIPLIERS: Record<string, number> = {
  noida: 1.0,
  delhi: 1.08,
  gurgaon: 1.12,
  ghaziabad: 0.95,
  faridabad: 0.96,
  mumbai: 1.15,
  bengaluru: 1.14,
};

// Base daily wage benchmarks for trades (INR / full day shift)
const TRADE_BENCHMARKS: Record<string, BenchmarkData> = {
  warehouse: { min: 900, max: 1250, typical: 1050 },
  electrical: { min: 1200, max: 1700, typical: 1400 },
  plumbing: { min: 1100, max: 1550, typical: 1300 },
  construction: { min: 1000, max: 1450, typical: 1200 },
  carpentry: { min: 1150, max: 1600, typical: 1350 },
  painting: { min: 1050, max: 1500, typical: 1250 },
  driving: { min: 950, max: 1350, typical: 1100 },
  cleaning: { min: 750, max: 1050, typical: 900 },
  security: { min: 850, max: 1200, typical: 1000 },
  hospitality: { min: 800, max: 1150, typical: 950 },
  factory: { min: 800, max: 1100, typical: 920 },
  delivery: { min: 850, max: 1250, typical: 1000 },
  farming: { min: 700, max: 950, typical: 800 },
  'domestic help': { min: 750, max: 1100, typical: 900 },
  caregiving: { min: 1000, max: 1500, typical: 1250 },
  'appliance repair': { min: 1200, max: 1750, typical: 1450 },
};

export class FairPayService {
  /**
   * Get city multiplier safely
   */
  private getCityMultiplier(city: string): number {
    const key = (city || '').trim().toLowerCase();
    for (const [c, mult] of Object.entries(CITY_MULTIPLIERS)) {
      if (key.includes(c)) return mult;
    }
    return 1.0;
  }

  /**
   * Match trade to benchmark key
   */
  private getBenchmark(tradeOrCategory: string): BenchmarkData {
    const key = (tradeOrCategory || '').trim().toLowerCase();
    for (const [t, data] of Object.entries(TRADE_BENCHMARKS)) {
      if (key.includes(t) || t.includes(key)) return data;
    }
    return { min: 850, max: 1250, typical: 1000 };
  }

  /**
   * Calculate transparent Fair Pay estimate for a trade and location
   */
  public calculateFairPay(
    categoryOrTrade: string,
    locationCity: string = 'Noida',
    demandPressure: 'HIGH' | 'GOOD' | 'MODERATE' | 'LOW' = 'GOOD'
  ): FairPayEstimate {
    const base = this.getBenchmark(categoryOrTrade);
    const cityMult = this.getCityMultiplier(locationCity);

    let demandMult = 1.0;
    if (demandPressure === 'HIGH') demandMult = 1.08;
    else if (demandPressure === 'GOOD') demandMult = 1.03;
    else if (demandPressure === 'LOW') demandMult = 0.96;

    const roundTo50 = (val: number) => Math.round(val / 50) * 50;

    const recommendedMin = roundTo50(base.min * cityMult * demandMult);
    const recommendedMax = roundTo50(base.max * cityMult * demandMult);
    const typicalWage = roundTo50(base.typical * cityMult * demandMult);
    const benchmark = roundTo50(base.typical * cityMult);

    return {
      category: categoryOrTrade,
      locationCity,
      recommendedMinWage: recommendedMin,
      recommendedMaxWage: recommendedMax,
      typicalWage,
      areaBenchmark: benchmark,
      demandMultiplier: demandMult,
      currency: 'INR',
      guidanceText: `Typical pay in ${locationCity} is ₹${recommendedMin.toLocaleString('en-IN')}–₹${recommendedMax.toLocaleString('en-IN')}/day`,
    };
  }

  /**
   * Employer-side feedback: evaluates whether an offer will attract sufficient applicants
   */
  public evaluateEmployerOffer(
    offeredWage: number,
    categoryOrTrade: string,
    locationCity: string = 'Noida'
  ): {
    status: 'BELOW_BENCHMARK' | 'FAIR' | 'COMPETITIVE' | 'PREMIUM';
    suggestedRange: string;
    guidance: string;
    badgeColor: string;
    isUrgentWarning: boolean;
  } {
    const estimate = this.calculateFairPay(categoryOrTrade, locationCity);
    const rangeStr = `₹${estimate.recommendedMinWage.toLocaleString('en-IN')}–₹${estimate.recommendedMaxWage.toLocaleString('en-IN')}`;

    if (offeredWage < estimate.recommendedMinWage) {
      const diff = estimate.recommendedMinWage - offeredWage;
      return {
        status: 'BELOW_BENCHMARK',
        suggestedRange: rangeStr,
        guidance: `Your ₹${offeredWage} offer is ₹${diff} below typical area rates and may receive fewer applicants.`,
        badgeColor: '#B45309', // warning
        isUrgentWarning: true,
      };
    }

    if (offeredWage >= estimate.recommendedMaxWage) {
      return {
        status: 'PREMIUM',
        suggestedRange: rangeStr,
        guidance: `Premium compensation. Top-rated workers will be prioritized immediately.`,
        badgeColor: '#1A6B3C', // forestGreen
        isUrgentWarning: false,
      };
    }

    if (offeredWage >= estimate.typicalWage) {
      return {
        status: 'COMPETITIVE',
        suggestedRange: rangeStr,
        guidance: `Competitive pay for ${locationCity}. Fast worker staffing expected.`,
        badgeColor: '#1A6B3C',
        isUrgentWarning: false,
      };
    }

    return {
      status: 'FAIR',
      suggestedRange: rangeStr,
      guidance: `Fair standard compensation for this trade in ${locationCity}.`,
      badgeColor: '#5A6349', // olive
      isUrgentWarning: false,
    };
  }

  /**
   * Worker-side transparency: informs worker if pay is fair, above average, or lower
   */
  public evaluateWorkerWage(
    jobWage: number,
    categoryOrTrade: string,
    locationCity: string = 'Noida'
  ): {
    badgeText: string;
    typicalRangeText: string;
    isFair: boolean;
    isAboveAverage: boolean;
  } {
    const estimate = this.calculateFairPay(categoryOrTrade, locationCity);
    const typicalRangeText = `Typical range ₹${estimate.recommendedMinWage.toLocaleString('en-IN')}–₹${estimate.recommendedMaxWage.toLocaleString('en-IN')}`;

    if (jobWage >= estimate.typicalWage + 100) {
      return {
        badgeText: 'Above average for this area',
        typicalRangeText,
        isFair: true,
        isAboveAverage: true,
      };
    }

    if (jobWage >= estimate.recommendedMinWage) {
      return {
        badgeText: 'Fair for this area',
        typicalRangeText,
        isFair: true,
        isAboveAverage: false,
      };
    }

    return {
      badgeText: 'Entry-level rate',
      typicalRangeText,
      isFair: false,
      isAboveAverage: false,
    };
  }
}

export const fairPayService = new FairPayService();
