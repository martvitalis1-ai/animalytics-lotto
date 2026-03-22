// ============================================================
// ADVANCED PROBABILITY ENGINE - Variable percentages 35-98%
// with status tags, deterministic seeding, and LEARNED WEIGHTS
// ============================================================

import { getAnimalByCode, getAnimalName, getCodesForLottery } from './animalData';
import { supabase } from '@/integrations/supabase/client';

export type PredictionStatus = 'CALIENTE' | 'FUERTE' | 'POSIBLE' | 'FRÍO';

export interface AdvancedPrediction {
  code: string;
  name: string;
  probability: number;
  status: PredictionStatus;
  statusEmoji: string;
  reason: string;
  daysSince: number;
  frequency: number;
  hourlyStrength: number;
  learnedBoost: number;
}

export interface HourlyForecast {
  time: string;
  predictions: AdvancedPrediction[];
  topPick: AdvancedPrediction | null;
}

// Cache for learned weights to avoid repeated DB calls
let weightCache: Record<string, Record<string, number>> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

// Fetch learned weights from database
const fetchLearnedWeights = async (lotteryId: string): Promise<Record<string, number>> => {
  const now = Date.now();
  
  // Return cached if valid
  if (weightCache[lotteryId] && now - cacheTimestamp < CACHE_TTL) {
    return weightCache[lotteryId];
  }
  
  try {
    const { data } = await supabase
      .from('learning_state')
      .select('hypothesis_id, weight, status')
      .eq('lottery_id', lotteryId);

    const weights: Record<string, number> = {};
    if (data) {
      for (const row of data) {
        if (row.status !== 'deactivated') {
          weights[row.hypothesis_id] = Number(row.weight) || 0.5;
        }
      }
    }
    
    weightCache[lotteryId] = weights;
    cacheTimestamp = now;
    return weights;
  } catch {
    return weightCache[lotteryId] || {};
  }
};

// Deterministic hash function for consistent results
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Seeded random for deterministic probabilities
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Get status based on probability
const getStatusFromProbability = (prob: number): { status: PredictionStatus; emoji: string } => {
  if (prob >= 90) return { status: 'CALIENTE', emoji: '🔥' };
  if (prob >= 75) return { status: 'FUERTE', emoji: '⚡' };
  if (prob >= 50) return { status: 'POSIBLE', emoji: '⚖️' };
  return { status: 'FRÍO', emoji: '❄️' };
};

// Calculate advanced probability WITH learned weights
export const calculateAdvancedProbability = async (
  code: string,
  lotteryId: string,
  drawTime: string,
  history: any[],
  dateStr: string
): Promise<AdvancedPrediction> => {
  const animal = getAnimalByCode(code);
  const name = animal?.name || `Número ${code}`;
  
  // Get learned weights from database
  const learnedWeights = await fetchLearnedWeights(lotteryId);
  
  // Create unique seed for this animal/hour/date combination
  const seed = hashCode(`${code}-${lotteryId}-${drawTime}-${dateStr}`);
  
  // Filter history for this lottery (use ALL history, no limits)
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const hourlyHistory = lotteryHistory.filter(h => h.draw_time === drawTime);
  
  // Calculate frequency
  const totalFreq = lotteryHistory.filter(h => {
    const num = h.result_number?.toString().trim();
    return num === code || (code !== "00" && parseInt(num) === parseInt(code));
  }).length;
  
  const hourlyFreq = hourlyHistory.filter(h => {
    const num = h.result_number?.toString().trim();
    return num === code || (code !== "00" && parseInt(num) === parseInt(code));
  }).length;
  
  // Calculate days since last appearance
  const now = new Date();
  let daysSince = 30;
  for (const draw of lotteryHistory) {
    const num = draw.result_number?.toString().trim();
    if (num === code || (code !== "00" && parseInt(num) === parseInt(code))) {
      const drawDate = new Date(draw.created_at || draw.draw_date);
      daysSince = Math.ceil((now.getTime() - drawDate.getTime()) / (1000 * 60 * 60 * 24));
      break;
    }
  }
  
  // Base probability from seeded random (gives 0-1)
  const baseRandom = seededRandom(seed);
  
  // Calculate learned boost based on relevant pattern weights
  let learnedBoost = 0;
  const patternWeights = [
    'spatial_neighbor', 'spatial_opposite', 'math_sum_2', 'math_diff_2',
    'overdue', 'hourly_trend', 'daily_trend', 'frequency'
  ];
  
  for (const pattern of patternWeights) {
    const weight = learnedWeights[pattern];
    if (weight !== undefined) {
      // Weights above 0.5 give positive boost, below give negative
      learnedBoost += (weight - 0.5) * 10;
    }
  }
  
  // Factors that influence probability
  const frequencyFactor = Math.min(totalFreq / 10, 1) * 15; // 0-15 points
  const hourlyFactor = Math.min(hourlyFreq / 5, 1) * 20; // 0-20 points
  const overdueFactor = Math.min(daysSince / 15, 1) * 25; // 0-25 points (overdue = higher)
  const randomFactor = baseRandom * 20; // 0-20 points from seed
  
  // Apply learned boost (can add or subtract up to 15 points)
  const learnedFactor = Math.max(-15, Math.min(15, learnedBoost));
  
  // Calculate raw probability
  let rawProbability = 35 + frequencyFactor + hourlyFactor + overdueFactor + randomFactor + learnedFactor;
  
  // Clamp to 35-98 range and format as 2-digit integer (no decimals)
  const probability = Math.max(1, Math.min(99, Math.floor(rawProbability)));
  
  // Get status
  const { status, emoji } = getStatusFromProbability(probability);
  
  // Generate reason including learned factor
  let reason = '';
  if (probability >= 90) {
    reason = `Altísima probabilidad. Frecuencia: ${totalFreq}, Días sin salir: ${daysSince}`;
  } else if (probability >= 75) {
    reason = `Tendencia fuerte a esta hora. Apareció ${hourlyFreq} veces en este horario`;
  } else if (probability >= 50) {
    reason = `Comportamiento normal. ${daysSince} días desde última aparición`;
  } else {
    reason = `Frecuencia baja. Solo ${totalFreq} apariciones en historial`;
  }
  
  if (learnedFactor > 5) {
    reason += '. Patrones aprendidos favorables.';
  } else if (learnedFactor < -5) {
    reason += '. Patrones históricos desfavorables.';
  }
  
  return {
    code,
    name,
    probability,
    status,
    statusEmoji: emoji,
    reason,
    daysSince,
    frequency: totalFreq,
    hourlyStrength: hourlyFreq,
    learnedBoost: learnedFactor,
  };
};

// Sync version for backwards compatibility (uses cached weights)
export const calculateAdvancedProbabilitySync = (
  code: string,
  lotteryId: string,
  drawTime: string,
  history: any[],
  dateStr: string
): AdvancedPrediction => {
  const animal = getAnimalByCode(code);
  const name = animal?.name || `Número ${code}`;
  
  // Use cached weights if available
  const learnedWeights = weightCache[lotteryId] || {};
  
  const seed = hashCode(`${code}-${lotteryId}-${drawTime}-${dateStr}`);
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const hourlyHistory = lotteryHistory.filter(h => h.draw_time === drawTime);
  
  const totalFreq = lotteryHistory.filter(h => {
    const num = h.result_number?.toString().trim();
    return num === code || (code !== "00" && parseInt(num) === parseInt(code));
  }).length;
  
  const hourlyFreq = hourlyHistory.filter(h => {
    const num = h.result_number?.toString().trim();
    return num === code || (code !== "00" && parseInt(num) === parseInt(code));
  }).length;
  
  const now = new Date();
  let daysSince = 30;
  for (const draw of lotteryHistory) {
    const num = draw.result_number?.toString().trim();
    if (num === code || (code !== "00" && parseInt(num) === parseInt(code))) {
      const drawDate = new Date(draw.created_at || draw.draw_date);
      daysSince = Math.ceil((now.getTime() - drawDate.getTime()) / (1000 * 60 * 60 * 24));
      break;
    }
  }
  
  const baseRandom = seededRandom(seed);
  
  let learnedBoost = 0;
  for (const pattern of ['spatial_neighbor', 'overdue', 'frequency', 'hourly_trend']) {
    const weight = learnedWeights[pattern];
    if (weight !== undefined) {
      learnedBoost += (weight - 0.5) * 10;
    }
  }
  
  const frequencyFactor = Math.min(totalFreq / 10, 1) * 15;
  const hourlyFactor = Math.min(hourlyFreq / 5, 1) * 20;
  const overdueFactor = Math.min(daysSince / 15, 1) * 25;
  const randomFactor = baseRandom * 20;
  const learnedFactor = Math.max(-15, Math.min(15, learnedBoost));
  
  let rawProbability = 35 + frequencyFactor + hourlyFactor + overdueFactor + randomFactor + learnedFactor;
  const probability = Math.max(1, Math.min(99, Math.floor(rawProbability)));
  const { status, emoji } = getStatusFromProbability(probability);
  
  let reason = '';
  if (probability >= 90) {
    reason = `Altísima probabilidad. Frecuencia: ${totalFreq}, Días sin salir: ${daysSince}`;
  } else if (probability >= 75) {
    reason = `Tendencia fuerte. Apareció ${hourlyFreq}x en este horario`;
  } else if (probability >= 50) {
    reason = `${daysSince} días desde última aparición`;
  } else {
    reason = `Solo ${totalFreq} apariciones en historial`;
  }
  
  return {
    code,
    name,
    probability,
    status,
    statusEmoji: emoji,
    reason,
    daysSince,
    frequency: totalFreq,
    hourlyStrength: hourlyFreq,
    learnedBoost: learnedFactor,
  };
};

// Generate predictions for all numbers in a lottery at a specific hour
export const generateHourlyPredictions = (
  lotteryId: string,
  drawTime: string,
  history: any[],
  dateStr: string
): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  
  // Pre-fetch weights for cache
  fetchLearnedWeights(lotteryId);
  
  const predictions = codes.map(code => 
    calculateAdvancedProbabilitySync(code, lotteryId, drawTime, history, dateStr)
  );
  
  return predictions.sort((a, b) => b.probability - a.probability);
};

// Generate full day forecast
export const generateDayForecast = (
  lotteryId: string,
  drawTimes: string[],
  history: any[],
  dateStr: string
): HourlyForecast[] => {
  return drawTimes.map(time => {
    const predictions = generateHourlyPredictions(lotteryId, time, history, dateStr);
    return {
      time,
      predictions: predictions.slice(0, 5),
      topPick: predictions[0] || null
    };
  });
};

// Get top predictions for explosive data section
export const getExplosivePredictions = (
  lotteryId: string,
  history: any[],
  dateStr: string,
  count: number = 3
): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  
  // Pre-fetch weights
  fetchLearnedWeights(lotteryId);
  
  const predictions = codes.map(code => 
    calculateAdvancedProbabilitySync(code, lotteryId, 'DAILY', history, dateStr)
  );
  
  return predictions.sort((a, b) => b.probability - a.probability).slice(0, count);
};

// Get "El Regalo" - the two golden numbers
export const getGoldenNumbers = (
  lotteryId: string,
  history: any[],
  dateStr: string
): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  
  fetchLearnedWeights(lotteryId);
  
  const predictions = codes.map(code => 
    calculateAdvancedProbabilitySync(code, lotteryId, 'REGALO', history, dateStr)
  );
  
  // Get overdue numbers with good probability
  const overdueHigh = predictions
    .filter(p => p.daysSince > 5 && p.probability > 60)
    .slice(0, 2);
  
  if (overdueHigh.length >= 2) {
    return overdueHigh;
  }
  
  return predictions.slice(0, 2);
};

// Force refresh weight cache
export const refreshWeightCache = async (lotteryId: string): Promise<void> => {
  cacheTimestamp = 0;
  await fetchLearnedWeights(lotteryId);
};
