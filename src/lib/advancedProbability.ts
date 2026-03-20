// src/lib/advancedProbability.ts
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

let weightCache: Record<string, Record<string, number>> = {};
let cacheTimestamp = 0;
const CACHE_TTL = 60000;

const fetchLearnedWeights = async (lotteryId: string): Promise<Record<string, number>> => {
  const now = Date.now();
  if (weightCache[lotteryId] && now - cacheTimestamp < CACHE_TTL) return weightCache[lotteryId];
  try {
    const { data } = await supabase.from('learning_state').select('hypothesis_id, weight, status').eq('lottery_id', lotteryId);
    const weights: Record<string, number> = {};
    if (data) {
      for (const row of data) {
        if (row.status !== 'deactivated') weights[row.hypothesis_id] = Number(row.weight) || 0.5;
      }
    }
    weightCache[lotteryId] = weights;
    cacheTimestamp = now;
    return weights;
  } catch { return weightCache[lotteryId] || {}; }
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getStatusFromProbability = (prob: number): { status: PredictionStatus; emoji: string } => {
  if (prob >= 90) return { status: 'CALIENTE', emoji: '🔥' };
  if (prob >= 75) return { status: 'FUERTE', emoji: '⚡' };
  if (prob >= 50) return { status: 'POSIBLE', emoji: '⚖️' };
  return { status: 'FRÍO', emoji: '❄️' };
};

export const calculateAdvancedProbability = async (code: string, lotteryId: string, drawTime: string, history: any[], dateStr: string): Promise<AdvancedPrediction> => {
  const animal = getAnimalByCode(code);
  const name = animal?.name || `Número ${code}`;
  const learnedWeights = await fetchLearnedWeights(lotteryId);
  const seed = hashCode(`${code}-${lotteryId}-${drawTime}-${dateStr}`);
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const hourlyHistory = lotteryHistory.filter(h => h.draw_time === drawTime);
  
  // COMPARACIÓN ESTRICTA DE TEXTO (CORRECCIÓN 00)
  const totalFreq = lotteryHistory.filter(h => h.result_number?.toString().trim() === code).length;
  const hourlyFreq = hourlyHistory.filter(h => h.result_number?.toString().trim() === code).length;
  
  const now = new Date();
  let daysSince = 30;
  for (const draw of lotteryHistory) {
    if (draw.result_number?.toString().trim() === code) {
      const drawDate = new Date(draw.created_at || draw.draw_date);
      daysSince = Math.ceil((now.getTime() - drawDate.getTime()) / (1000 * 60 * 60 * 24));
      break;
    }
  }
  
  const baseRandom = seededRandom(seed);
  let learnedBoost = 0;
  for (const pattern of ['spatial_neighbor', 'spatial_opposite', 'math_sum_2', 'math_diff_2', 'overdue', 'hourly_trend', 'daily_trend', 'frequency']) {
    const weight = learnedWeights[pattern];
    if (weight !== undefined) learnedBoost += (weight - 0.5) * 10;
  }
  
  const frequencyFactor = Math.min(totalFreq / 10, 1) * 15;
  const hourlyFactor = Math.min(hourlyFreq / 5, 1) * 20;
  const overdueFactor = Math.min(daysSince / 15, 1) * 25;
  const randomFactor = baseRandom * 20;
  const learnedFactor = Math.max(-15, Math.min(15, learnedBoost));
  
  let rawProbability = 35 + frequencyFactor + hourlyFactor + overdueFactor + randomFactor + learnedFactor;
  const probability = Math.max(1, Math.min(99, Math.floor(rawProbability)));
  const { status, emoji } = getStatusFromProbability(probability);
  
  return { code, name, probability, status, statusEmoji: emoji, reason: `Probabilidad calculada por frecuencia y tendencia horaria.`, daysSince, frequency: totalFreq, hourlyStrength: hourlyFreq, learnedBoost: learnedFactor };
};

export const calculateAdvancedProbabilitySync = (code: string, lotteryId: string, drawTime: string, history: any[], dateStr: string): AdvancedPrediction => {
  const animal = getAnimalByCode(code);
  const name = animal?.name || `Número ${code}`;
  const learnedWeights = weightCache[lotteryId] || {};
  const seed = hashCode(`${code}-${lotteryId}-${drawTime}-${dateStr}`);
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const hourlyHistory = lotteryHistory.filter(h => h.draw_time === drawTime);
  
  // COMPARACIÓN ESTRICTA DE TEXTO (CORRECCIÓN 00)
  const totalFreq = lotteryHistory.filter(h => h.result_number?.toString().trim() === code).length;
  const hourlyFreq = hourlyHistory.filter(h => h.result_number?.toString().trim() === code).length;
  
  const now = new Date();
  let daysSince = 30;
  for (const draw of lotteryHistory) {
    if (draw.result_number?.toString().trim() === code) {
      const drawDate = new Date(draw.created_at || draw.draw_date);
      daysSince = Math.ceil((now.getTime() - drawDate.getTime()) / (1000 * 60 * 60 * 24));
      break;
    }
  }
  
  const baseRandom = seededRandom(seed);
  let learnedBoost = 0;
  for (const pattern of ['spatial_neighbor', 'overdue', 'frequency', 'hourly_trend']) {
    const weight = learnedWeights[pattern];
    if (weight !== undefined) learnedBoost += (weight - 0.5) * 10;
  }
  
  const frequencyFactor = Math.min(totalFreq / 10, 1) * 15;
  const hourlyFactor = Math.min(hourlyFreq / 5, 1) * 20;
  const overdueFactor = Math.min(daysSince / 15, 1) * 25;
  const randomFactor = baseRandom * 20;
  const learnedFactor = Math.max(-15, Math.min(15, learnedBoost));
  
  const probability = Math.max(1, Math.min(99, Math.floor(35 + frequencyFactor + hourlyFactor + overdueFactor + randomFactor + learnedFactor)));
  const { status, emoji } = getStatusFromProbability(probability);
  
  return { code, name, probability, status, statusEmoji: emoji, reason: '', daysSince, frequency: totalFreq, hourlyStrength: hourlyFreq, learnedBoost: learnedFactor };
};

export const generateHourlyPredictions = (lotteryId: string, drawTime: string, history: any[], dateStr: string): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  fetchLearnedWeights(lotteryId);
  return codes.map(code => calculateAdvancedProbabilitySync(code, lotteryId, drawTime, history, dateStr)).sort((a, b) => b.probability - a.probability);
};

export const generateDayForecast = (lotteryId: string, drawTimes: string[], history: any[], dateStr: string): HourlyForecast[] => {
  return drawTimes.map(time => {
    const predictions = generateHourlyPredictions(lotteryId, time, history, dateStr);
    return { time, predictions: predictions.slice(0, 5), topPick: predictions[0] || null };
  });
};

export const getExplosivePredictions = (lotteryId: string, history: any[], dateStr: string, count: number = 3): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  fetchLearnedWeights(lotteryId);
  return codes.map(code => calculateAdvancedProbabilitySync(code, lotteryId, 'DAILY', history, dateStr)).sort((a, b) => b.probability - a.probability).slice(0, count);
};

export const getGoldenNumbers = (lotteryId: string, history: any[], dateStr: string): AdvancedPrediction[] => {
  const codes = getCodesForLottery(lotteryId);
  fetchLearnedWeights(lotteryId);
  const predictions = codes.map(code => calculateAdvancedProbabilitySync(code, lotteryId, 'REGALO', history, dateStr));
  const overdueHigh = predictions.filter(p => p.daysSince > 5 && p.probability > 60).slice(0, 2);
  return overdueHigh.length >= 2 ? overdueHigh : predictions.slice(0, 2);
};

export const refreshWeightCache = async (lotteryId: string): Promise<void> => {
  cacheTimestamp = 0;
  await fetchLearnedWeights(lotteryId);
};
