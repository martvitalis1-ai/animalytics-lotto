// ============================================================
// LEARNING ENGINE - Continuous pattern learning with dynamic weights
// FULLY PERSISTENT - Uses Supabase, NO localStorage
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { 
  generateSpatialCandidates, 
  calculateMathPatterns, 
  calculateOverdueNumbers,
  analyzeBestHours,
  analyzeBestDays 
} from './roulettePatterns';
import { getCodesForLottery, getAnimalByCode } from './animalData';
import { getLearnedWeights } from './hypothesisEngine';

export interface PatternResult {
  code: string;
  name: string;
  score: number;
  probability: number;
  sources: string[];
  status: 'CALIENTE' | 'FUERTE' | 'POSIBLE' | 'FRÍO';
  statusEmoji: string;
  isOverdue: boolean;
  daysSince?: number;
  bestHour?: string;
  bestDay?: string;
}

export interface PatternWeight {
  patternType: string;
  weight: number;
  hits: number;
  misses: number;
  lastUpdated: string;
}

// Default weights for each pattern type
const DEFAULT_WEIGHTS: Record<string, number> = {
  spatial_neighbor: 0.6,
  spatial_opposite: 0.5,
  math_sum: 0.4,
  math_diff: 0.35,
  math_digital: 0.3,
  overdue: 0.7,
  hourly_trend: 0.45,
  daily_trend: 0.4,
  frequency: 0.5,
};

// Load weights from Supabase
export const loadWeights = async (lotteryId: string): Promise<Record<string, PatternWeight>> => {
  try {
    const { data, error } = await supabase
      .from('learning_state')
      .select('hypothesis_id, weight, hits, misses, updated_at')
      .eq('lottery_id', lotteryId);

    if (error || !data || data.length === 0) {
      return getDefaultWeights();
    }

    const weights: Record<string, PatternWeight> = {};
    for (const row of data) {
      weights[row.hypothesis_id] = {
        patternType: row.hypothesis_id,
        weight: Number(row.weight) || 0.5,
        hits: row.hits || 0,
        misses: row.misses || 0,
        lastUpdated: row.updated_at,
      };
    }
    return weights;
  } catch (e) {
    console.error('Error loading weights:', e);
    return getDefaultWeights();
  }
};

// Get default weights
const getDefaultWeights = (): Record<string, PatternWeight> => {
  const defaults: Record<string, PatternWeight> = {};
  for (const [type, weight] of Object.entries(DEFAULT_WEIGHTS)) {
    defaults[type] = {
      patternType: type,
      weight,
      hits: 0,
      misses: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  return defaults;
};

// Update weight in Supabase
export const updateWeight = async (
  lotteryId: string,
  patternType: string,
  isHit: boolean
): Promise<void> => {
  try {
    const { data: existing } = await supabase
      .from('learning_state')
      .select('*')
      .eq('lottery_id', lotteryId)
      .eq('hypothesis_id', patternType)
      .maybeSingle();

    const now = new Date().toISOString();
    let hits = existing?.hits || 0;
    let misses = existing?.misses || 0;
    let weight = Number(existing?.weight) || DEFAULT_WEIGHTS[patternType] || 0.5;

    if (isHit) {
      hits++;
      weight = Math.min(1.0, weight + 0.05);
    } else {
      misses++;
      weight = Math.max(0.1, weight - 0.02);
    }

    const totalPredictions = hits + misses;
    if (totalPredictions >= 20) {
      const hitRate = hits / totalPredictions;
      const randomChance = 1 / 37;
      
      if (hitRate < randomChance * 0.5) {
        weight = Math.max(0.1, weight * 0.8);
      } else if (hitRate > randomChance * 2) {
        weight = Math.min(1.0, weight * 1.1);
      }
    }

    await supabase.from('learning_state').upsert({
      lottery_id: lotteryId,
      hypothesis_id: patternType,
      pattern_type: patternType,
      weight,
      hits,
      misses,
      hit_rate: totalPredictions > 0 ? hits / totalPredictions : 0,
      updated_at: now,
    }, { onConflict: 'lottery_id,hypothesis_id' });
  } catch (e) {
    console.error('Error updating weight:', e);
  }
};

// Get status based on score
const getStatusFromScore = (score: number): { status: PatternResult['status']; emoji: string } => {
  if (score >= 0.85) return { status: 'CALIENTE', emoji: '🔥' };
  if (score >= 0.65) return { status: 'FUERTE', emoji: '⚡' };
  if (score >= 0.45) return { status: 'POSIBLE', emoji: '⚖️' };
  return { status: 'FRÍO', emoji: '❄️' };
};

// Convert score to probability percentage (35-98%)
const scoreToProbability = (score: number): number => {
  return Math.round(35 + (score * 63));
};

// Main prediction function using all patterns with learned weights
export const generateWeightedPredictions = async (
  history: any[],
  lotteryId: string,
  drawTime: string,
  dateStr: string
): Promise<PatternResult[]> => {
  // Get learned weights from database
  const learnedWeights = await getLearnedWeights(lotteryId);
  const codes = getCodesForLottery(lotteryId);
  const maxNumber = lotteryId === 'guacharito' ? 99 : lotteryId === 'guacharo' ? 75 : 36;
  
  // Score accumulator for each code
  const scores: Record<string, { 
    total: number; 
    sources: string[];
    isOverdue: boolean;
    daysSince?: number;
    bestHour?: string;
    bestDay?: string;
  }> = {};
  
  for (const code of codes) {
    scores[code] = { total: 0, sources: [], isOverdue: false };
  }
  
  // Use full history, no artificial limits
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const recentResults = lotteryHistory.slice(0, 20).map(h => h.result_number?.toString().trim());
  const lastNumber = recentResults[0] || "0";
  
  // Get weight with fallback
  const getWeight = (pattern: string): number => {
    return learnedWeights[pattern] || DEFAULT_WEIGHTS[pattern] || 0.5;
  };
  
  // 1. Spatial patterns (neighbors, opposite)
  if (lastNumber) {
    const spatialCandidates = generateSpatialCandidates(lastNumber, lotteryId);
    for (const candidate of spatialCandidates) {
      if (scores[candidate.code]) {
        const patternType = candidate.source.includes('Opuesto') ? 'spatial_opposite' : 'spatial_neighbor';
        const weight = getWeight(patternType);
        scores[candidate.code].total += candidate.weight * weight;
        scores[candidate.code].sources.push(candidate.source);
      }
    }
  }
  
  // 2. Mathematical patterns
  if (recentResults.length >= 2) {
    const mathPatterns = calculateMathPatterns(recentResults);
    for (const pattern of mathPatterns) {
      const normalizedCode = pattern.code.padStart(2, '0').slice(-2);
      if (scores[normalizedCode] || scores[pattern.code]) {
        const targetCode = scores[normalizedCode] ? normalizedCode : pattern.code;
        const patternType = pattern.formula.includes('Σ') ? 'math_sum' : 
                           pattern.formula.includes('Δ') ? 'math_diff' : 'math_digital';
        const weight = getWeight(patternType);
        scores[targetCode].total += pattern.weight * weight;
        scores[targetCode].sources.push(pattern.formula);
      }
    }
  }
  
  // 3. Overdue numbers - use full history
  const overdueNumbers = calculateOverdueNumbers(history, lotteryId, maxNumber, 5);
  for (const overdue of overdueNumbers) {
    if (scores[overdue.code]) {
      const weight = getWeight('overdue');
      scores[overdue.code].total += overdue.weight * weight;
      scores[overdue.code].sources.push(`Vencido: ${overdue.daysSince} días`);
      scores[overdue.code].isOverdue = true;
      scores[overdue.code].daysSince = overdue.daysSince;
    }
  }
  
  // 4. Frequency analysis - use full history
  const frequencyMap: Record<string, number> = {};
  for (const draw of lotteryHistory) {
    const num = draw.result_number?.toString().trim();
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
  }
  
  const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Object.keys(frequencyMap).length || 1;
  
  for (const [code, freq] of Object.entries(frequencyMap)) {
    if (scores[code]) {
      const freqScore = Math.min(freq / avgFreq, 2) * 0.3;
      const weight = getWeight('frequency');
      scores[code].total += freqScore * weight;
      if (freq > avgFreq) {
        scores[code].sources.push(`Frecuente: ${freq}x`);
      }
    }
  }
  
  // 5. Hourly trends
  for (const code of codes) {
    const hourlyTrends = analyzeBestHours(history, lotteryId, code);
    const currentHourTrend = hourlyTrends.find(t => t.time === drawTime);
    if (currentHourTrend && currentHourTrend.frequency >= 2) {
      const weight = getWeight('hourly_trend');
      scores[code].total += (currentHourTrend.percentage / 100) * weight;
      scores[code].sources.push(`Hora favorable: ${currentHourTrend.percentage}%`);
      scores[code].bestHour = drawTime;
    }
  }
  
  // 6. Daily trends
  const today = new Date(dateStr);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDay = dayNames[today.getDay()];
  
  for (const code of codes) {
    const dailyTrends = analyzeBestDays(history, lotteryId, code);
    const currentDayTrend = dailyTrends.find(t => t.day === currentDay);
    if (currentDayTrend && currentDayTrend.frequency >= 2) {
      const weight = getWeight('daily_trend');
      scores[code].total += (currentDayTrend.percentage / 100) * weight;
      scores[code].sources.push(`${currentDay} favorable: ${currentDayTrend.percentage}%`);
      scores[code].bestDay = currentDay;
    }
  }
  
  // Normalize scores to 0-1 range
  const maxScore = Math.max(...Object.values(scores).map(s => s.total), 1);
  
  // Build final results
  const results: PatternResult[] = [];
  
  for (const [code, scoreData] of Object.entries(scores)) {
    const normalizedScore = scoreData.total / maxScore;
    const { status, emoji } = getStatusFromScore(normalizedScore);
    const animal = getAnimalByCode(code);
    
    results.push({
      code,
      name: animal?.name || `Número ${code}`,
      score: normalizedScore,
      probability: scoreToProbability(normalizedScore),
      sources: scoreData.sources,
      status,
      statusEmoji: emoji,
      isOverdue: scoreData.isOverdue,
      daysSince: scoreData.daysSince,
      bestHour: scoreData.bestHour,
      bestDay: scoreData.bestDay,
    });
  }
  
  return results.sort((a, b) => b.score - a.score);
};

// Record a prediction result for learning
export const recordPredictionResult = async (
  lotteryId: string,
  predictedCodes: string[],
  actualCode: string,
  patternSources: string[][]
): Promise<void> => {
  for (let i = 0; i < predictedCodes.length; i++) {
    const isHit = predictedCodes[i] === actualCode;
    const sources = patternSources[i] || [];
    
    for (const source of sources) {
      let patternType = 'frequency';
      if (source.includes('Vecino') || source.includes('opuesto')) patternType = 'spatial_neighbor';
      else if (source.includes('Opuesto')) patternType = 'spatial_opposite';
      else if (source.includes('Σ')) patternType = 'math_sum';
      else if (source.includes('Δ')) patternType = 'math_diff';
      else if (source.includes('Dig')) patternType = 'math_digital';
      else if (source.includes('Vencido')) patternType = 'overdue';
      else if (source.includes('Hora')) patternType = 'hourly_trend';
      else if (source.includes('favorable')) patternType = 'daily_trend';
      
      await updateWeight(lotteryId, patternType, isHit);
    }
  }
};

// Get current pattern weights for display
export const getPatternWeights = async (lotteryId: string): Promise<PatternWeight[]> => {
  const weights = await loadWeights(lotteryId);
  return Object.values(weights).sort((a, b) => b.weight - a.weight);
};

// Reset weights (admin function)
export const resetWeights = async (lotteryId: string): Promise<void> => {
  await supabase.from('learning_state').delete().eq('lottery_id', lotteryId);
};
