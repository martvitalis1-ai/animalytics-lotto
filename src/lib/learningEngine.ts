// ============================================================
// LEARNING ENGINE - Continuous pattern learning with dynamic weights
// Patterns are hypotheses, measured against random chance
// ============================================================

import { 
  generateSpatialCandidates, 
  calculateMathPatterns, 
  calculateOverdueNumbers,
  analyzeBestHours,
  analyzeBestDays 
} from './roulettePatterns';
import { getCodesForLottery, getAnimalByCode } from './animalData';

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

// Storage key for pattern weights
const WEIGHTS_STORAGE_KEY = 'lottery_pattern_weights';

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

// Load weights from localStorage
export const loadWeights = (): Record<string, PatternWeight> => {
  try {
    const stored = localStorage.getItem(WEIGHTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading weights:', e);
  }
  
  // Return defaults
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

// Save weights to localStorage
export const saveWeights = (weights: Record<string, PatternWeight>): void => {
  try {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  } catch (e) {
    console.error('Error saving weights:', e);
  }
};

// Update weight based on prediction result
export const updateWeight = (
  patternType: string,
  isHit: boolean,
  weights: Record<string, PatternWeight>
): Record<string, PatternWeight> => {
  const updated = { ...weights };
  
  if (!updated[patternType]) {
    updated[patternType] = {
      patternType,
      weight: DEFAULT_WEIGHTS[patternType] || 0.5,
      hits: 0,
      misses: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  const pattern = updated[patternType];
  
  if (isHit) {
    pattern.hits++;
    // Increase weight, max 1.0
    pattern.weight = Math.min(1.0, pattern.weight + 0.05);
  } else {
    pattern.misses++;
    // Decrease weight, min 0.1
    pattern.weight = Math.max(0.1, pattern.weight - 0.02);
  }
  
  pattern.lastUpdated = new Date().toISOString();
  
  // Compare to expected random chance
  const totalPredictions = pattern.hits + pattern.misses;
  if (totalPredictions >= 20) {
    const hitRate = pattern.hits / totalPredictions;
    const randomChance = 1 / 37; // ~2.7% for standard lottery
    
    // If hit rate is worse than random, reduce weight significantly
    if (hitRate < randomChance * 0.5) {
      pattern.weight = Math.max(0.1, pattern.weight * 0.8);
    }
    // If hit rate is much better than random, boost weight
    else if (hitRate > randomChance * 2) {
      pattern.weight = Math.min(1.0, pattern.weight * 1.1);
    }
  }
  
  saveWeights(updated);
  return updated;
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
  // Map 0-1 score to 35-98% range
  return Math.round(35 + (score * 63));
};

// Main prediction function using all patterns
export const generateWeightedPredictions = (
  history: any[],
  lotteryId: string,
  drawTime: string,
  dateStr: string
): PatternResult[] => {
  const weights = loadWeights();
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
  
  // Initialize all codes
  for (const code of codes) {
    scores[code] = { total: 0, sources: [], isOverdue: false };
  }
  
  // Get last results for pattern analysis
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const recentResults = lotteryHistory.slice(0, 10).map(h => h.result_number?.toString().trim());
  const lastNumber = recentResults[0] || "0";
  
  // 1. Spatial patterns (neighbors, opposite)
  if (lastNumber) {
    const spatialCandidates = generateSpatialCandidates(lastNumber, lotteryId);
    for (const candidate of spatialCandidates) {
      if (scores[candidate.code]) {
        const patternType = candidate.source.includes('Opuesto') ? 'spatial_opposite' : 'spatial_neighbor';
        const weight = weights[patternType]?.weight || DEFAULT_WEIGHTS[patternType];
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
        const weight = weights[patternType]?.weight || DEFAULT_WEIGHTS[patternType];
        scores[targetCode].total += pattern.weight * weight;
        scores[targetCode].sources.push(pattern.formula);
      }
    }
  }
  
  // 3. Overdue numbers
  const overdueNumbers = calculateOverdueNumbers(history, lotteryId, maxNumber, 5);
  for (const overdue of overdueNumbers) {
    if (scores[overdue.code]) {
      const weight = weights['overdue']?.weight || DEFAULT_WEIGHTS['overdue'];
      scores[overdue.code].total += overdue.weight * weight;
      scores[overdue.code].sources.push(`Vencido: ${overdue.daysSince} días`);
      scores[overdue.code].isOverdue = true;
      scores[overdue.code].daysSince = overdue.daysSince;
    }
  }
  
  // 4. Frequency analysis
  const frequencyMap: Record<string, number> = {};
  for (const draw of lotteryHistory.slice(0, 100)) {
    const num = draw.result_number?.toString().trim();
    frequencyMap[num] = (frequencyMap[num] || 0) + 1;
  }
  
  const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Object.keys(frequencyMap).length || 1;
  
  for (const [code, freq] of Object.entries(frequencyMap)) {
    if (scores[code]) {
      const freqScore = Math.min(freq / avgFreq, 2) * 0.3;
      const weight = weights['frequency']?.weight || DEFAULT_WEIGHTS['frequency'];
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
      const weight = weights['hourly_trend']?.weight || DEFAULT_WEIGHTS['hourly_trend'];
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
      const weight = weights['daily_trend']?.weight || DEFAULT_WEIGHTS['daily_trend'];
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
  
  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
};

// Record a prediction result for learning
export const recordPredictionResult = (
  predictedCodes: string[],
  actualCode: string,
  patternSources: string[][]
): void => {
  const weights = loadWeights();
  
  for (let i = 0; i < predictedCodes.length; i++) {
    const isHit = predictedCodes[i] === actualCode;
    const sources = patternSources[i] || [];
    
    for (const source of sources) {
      // Determine pattern type from source
      let patternType = 'frequency';
      if (source.includes('Vecino') || source.includes('opuesto')) patternType = 'spatial_neighbor';
      else if (source.includes('Opuesto')) patternType = 'spatial_opposite';
      else if (source.includes('Σ')) patternType = 'math_sum';
      else if (source.includes('Δ')) patternType = 'math_diff';
      else if (source.includes('Dig')) patternType = 'math_digital';
      else if (source.includes('Vencido')) patternType = 'overdue';
      else if (source.includes('Hora')) patternType = 'hourly_trend';
      else if (source.includes('favorable')) patternType = 'daily_trend';
      
      updateWeight(patternType, isHit, weights);
    }
  }
};

// Get current pattern weights for display
export const getPatternWeights = (): PatternWeight[] => {
  const weights = loadWeights();
  return Object.values(weights).sort((a, b) => b.weight - a.weight);
};

// Reset weights to defaults
export const resetWeights = (): void => {
  localStorage.removeItem(WEIGHTS_STORAGE_KEY);
};
