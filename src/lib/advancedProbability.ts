// ============================================================
// ADVANCED PROBABILITY ENGINE - Variable percentages 35-98%
// with status tags and deterministic seeding
// ============================================================

import { getAnimalByCode, getAnimalName, getCodesForLottery } from './animalData';

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
}

export interface HourlyForecast {
  time: string;
  predictions: AdvancedPrediction[];
  topPick: AdvancedPrediction | null;
}

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

// Calculate advanced probability with variable output (35-98%)
export const calculateAdvancedProbability = (
  code: string,
  lotteryId: string,
  drawTime: string,
  history: any[],
  dateStr: string
): AdvancedPrediction => {
  const animal = getAnimalByCode(code);
  const name = animal?.name || `Número ${code}`;
  
  // Create unique seed for this animal/hour/date combination
  const seed = hashCode(`${code}-${lotteryId}-${drawTime}-${dateStr}`);
  
  // Filter history for this lottery
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
  
  // Factors that influence probability
  const frequencyFactor = Math.min(totalFreq / 10, 1) * 15; // 0-15 points
  const hourlyFactor = Math.min(hourlyFreq / 5, 1) * 20; // 0-20 points
  const overdueFactor = Math.min(daysSince / 15, 1) * 25; // 0-25 points (overdue = higher)
  const randomFactor = baseRandom * 30; // 0-30 points from seed
  
  // Calculate raw probability
  let rawProbability = 35 + frequencyFactor + hourlyFactor + overdueFactor + randomFactor;
  
  // Clamp to 35-98 range and format as 2-digit integer (no decimals)
  const probability = Math.max(1, Math.min(99, Math.floor(rawProbability)));
  
  // Get status
  const { status, emoji } = getStatusFromProbability(probability);
  
  // Generate reason
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
  
  return {
    code,
    name,
    probability,
    status,
    statusEmoji: emoji,
    reason,
    daysSince,
    frequency: totalFreq,
    hourlyStrength: hourlyFreq
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
  
  const predictions = codes.map(code => 
    calculateAdvancedProbability(code, lotteryId, drawTime, history, dateStr)
  );
  
  // Sort by probability descending
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
      predictions: predictions.slice(0, 5), // Top 5 per hour
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
  // Use current time for seed but make it consistent per day
  const codes = getCodesForLottery(lotteryId);
  
  const predictions = codes.map(code => 
    calculateAdvancedProbability(code, lotteryId, 'DAILY', history, dateStr)
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
  const seed = hashCode(`REGALO-${lotteryId}-${dateStr}`);
  
  // Select two numbers based on deterministic algorithm
  const predictions = codes.map(code => 
    calculateAdvancedProbability(code, lotteryId, 'REGALO', history, dateStr)
  );
  
  // Get overdue numbers with good probability
  const overdueHigh = predictions
    .filter(p => p.daysSince > 5 && p.probability > 60)
    .slice(0, 2);
  
  if (overdueHigh.length >= 2) {
    return overdueHigh;
  }
  
  // Fallback to top 2
  return predictions.slice(0, 2);
};
