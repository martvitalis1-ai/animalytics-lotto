// ============================================================
// EXPLAINABLE PREDICTIONS - Transparent scoring with sources
// ADDITIVE MODULE - Every prediction shows contributing patterns
// NO absolute statements, only weighted probabilities
// ============================================================

import { getAnimalByCode, getAnimalName, getCodesForLottery } from './animalData';
import { generateExtendedMathPatterns } from './extendedMathPatterns';
import { getAssociationCandidates } from './animalAssociations';
import { 
  loadHypotheses, 
  getHypothesisWeight, 
  getMaxRangeForLottery,
  isValidLearningDate,
  LEARNING_START_DATE
} from './hypothesisEngine';
import { 
  generateSpatialCandidates, 
  calculateOverdueNumbers,
  analyzeBestHours,
  analyzeBestDays 
} from './roulettePatterns';
import type { PatternType, Hypothesis } from './hypothesisEngine';

// Contribution from a single pattern
export interface PatternContribution {
  patternType: PatternType;
  patternName: string;
  weight: number;
  contribution: number; // How much this pattern contributed to final score
  formula?: string; // Mathematical formula if applicable
  hypothesis: Hypothesis | null;
}

// Explainable prediction result
export interface ExplainablePrediction {
  code: string;
  name: string;
  score: number; // Raw score
  relativeProb: number; // Relative probability in %
  status: 'CALIENTE' | 'FUERTE' | 'POSIBLE' | 'FRÍO';
  statusEmoji: string;
  contributions: PatternContribution[];
  totalPatterns: number;
  isOverdue: boolean;
  daysSince?: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

// Get status from score
const getStatusFromScore = (score: number): { status: ExplainablePrediction['status']; emoji: string } => {
  if (score >= 0.8) return { status: 'CALIENTE', emoji: '🔥' };
  if (score >= 0.6) return { status: 'FUERTE', emoji: '⚡' };
  if (score >= 0.4) return { status: 'POSIBLE', emoji: '⚖️' };
  return { status: 'FRÍO', emoji: '❄️' };
};

// Generate explainable predictions
export const generateExplainablePredictions = (
  history: any[],
  lotteryId: string,
  drawTime: string,
  dateStr: string
): ExplainablePrediction[] => {
  const hypotheses = loadHypotheses();
  const codes = getCodesForLottery(lotteryId);
  const maxNumber = getMaxRangeForLottery(lotteryId);
  
  // Filter history for learning start date
  const validHistory = history.filter(h => {
    const drawDate = h.draw_date || h.created_at?.split('T')[0];
    return isValidLearningDate(drawDate);
  });
  
  // Score accumulator for each code
  const scores: Record<string, {
    total: number;
    contributions: PatternContribution[];
    isOverdue: boolean;
    daysSince?: number;
  }> = {};
  
  // Initialize all codes
  for (const code of codes) {
    scores[code] = { total: 0, contributions: [], isOverdue: false };
  }
  
  // Get recent results for pattern analysis
  const lotteryHistory = validHistory.filter(h => h.lottery_type === lotteryId);
  const recentResults = lotteryHistory.slice(0, 10).map(h => h.result_number?.toString().trim());
  const lastNumber = recentResults[0] || "0";
  
  // ========== 1. SPATIAL PATTERNS ==========
  if (lastNumber) {
    const spatialCandidates = generateSpatialCandidates(lastNumber, lotteryId);
    for (const candidate of spatialCandidates) {
      if (scores[candidate.code]) {
        const patternType: PatternType = candidate.source.includes('Opuesto') 
          ? 'spatial_opposite' 
          : candidate.source.includes('±') 
            ? 'spatial_jump' 
            : 'spatial_neighbor';
        
        const weight = getHypothesisWeight(patternType);
        if (weight === 0) continue;
        
        const contribution = candidate.weight * weight;
        scores[candidate.code].total += contribution;
        scores[candidate.code].contributions.push({
          patternType,
          patternName: candidate.source,
          weight,
          contribution,
          hypothesis: hypotheses[patternType] || null,
        });
      }
    }
  }
  
  // ========== 2. EXTENDED MATH PATTERNS ==========
  if (recentResults.length >= 2) {
    const mathPatterns = generateExtendedMathPatterns(recentResults, lotteryId);
    for (const pattern of mathPatterns) {
      const normalizedCode = pattern.code.padStart(2, '0').slice(-2);
      const targetCode = scores[normalizedCode] ? normalizedCode : pattern.code;
      
      if (scores[targetCode]) {
        scores[targetCode].total += pattern.weight;
        scores[targetCode].contributions.push({
          patternType: pattern.patternType,
          patternName: pattern.formula,
          weight: pattern.weight,
          contribution: pattern.weight,
          formula: pattern.formula,
          hypothesis: hypotheses[pattern.patternType] || null,
        });
      }
    }
  }
  
  // ========== 3. ANIMAL ASSOCIATIONS ==========
  if (recentResults.length > 0) {
    const associations = getAssociationCandidates(recentResults, lotteryId, validHistory);
    for (const assoc of associations) {
      if (scores[assoc.code]) {
        scores[assoc.code].total += assoc.weight;
        scores[assoc.code].contributions.push({
          patternType: assoc.patternType,
          patternName: assoc.source,
          weight: assoc.weight,
          contribution: assoc.weight,
          hypothesis: hypotheses[assoc.patternType] || null,
        });
      }
    }
  }
  
  // ========== 4. OVERDUE NUMBERS ==========
  const overdueNumbers = calculateOverdueNumbers(validHistory, lotteryId, maxNumber, 5);
  for (const overdue of overdueNumbers) {
    if (scores[overdue.code]) {
      const weight = getHypothesisWeight('overdue');
      if (weight === 0) continue;
      
      const contribution = overdue.weight * weight;
      scores[overdue.code].total += contribution;
      scores[overdue.code].contributions.push({
        patternType: 'overdue',
        patternName: `Vencido: ${overdue.daysSince} días`,
        weight,
        contribution,
        hypothesis: hypotheses['overdue'] || null,
      });
      scores[overdue.code].isOverdue = true;
      scores[overdue.code].daysSince = overdue.daysSince;
    }
  }
  
  // ========== 5. HOURLY TRENDS ==========
  for (const code of codes) {
    const hourlyTrends = analyzeBestHours(validHistory, lotteryId, code);
    const currentHourTrend = hourlyTrends.find(t => t.time === drawTime);
    if (currentHourTrend && currentHourTrend.frequency >= 2) {
      const weight = getHypothesisWeight('hourly_trend');
      if (weight === 0) continue;
      
      const contribution = (currentHourTrend.percentage / 100) * weight;
      scores[code].total += contribution;
      scores[code].contributions.push({
        patternType: 'hourly_trend',
        patternName: `Hora ${drawTime}: ${currentHourTrend.percentage}%`,
        weight,
        contribution,
        hypothesis: hypotheses['hourly_trend'] || null,
      });
    }
  }
  
  // ========== 6. DAILY TRENDS ==========
  const today = new Date(dateStr);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const currentDay = dayNames[today.getDay()];
  
  for (const code of codes) {
    const dailyTrends = analyzeBestDays(validHistory, lotteryId, code);
    const currentDayTrend = dailyTrends.find(t => t.day === currentDay);
    if (currentDayTrend && currentDayTrend.frequency >= 2) {
      const weight = getHypothesisWeight('daily_trend');
      if (weight === 0) continue;
      
      const contribution = (currentDayTrend.percentage / 100) * weight;
      scores[code].total += contribution;
      scores[code].contributions.push({
        patternType: 'daily_trend',
        patternName: `${currentDay}: ${currentDayTrend.percentage}%`,
        weight,
        contribution,
        hypothesis: hypotheses['daily_trend'] || null,
      });
    }
  }
  
  // ========== 7. FREQUENCY ANALYSIS ==========
  const frequencyMap: Record<string, number> = {};
  for (const draw of lotteryHistory.slice(0, 100)) {
    const num = draw.result_number?.toString().trim();
    if (num) frequencyMap[num] = (frequencyMap[num] || 0) + 1;
  }
  
  const avgFreq = Object.values(frequencyMap).reduce((a, b) => a + b, 0) / Math.max(Object.keys(frequencyMap).length, 1);
  
  for (const [code, freq] of Object.entries(frequencyMap)) {
    if (scores[code] && freq > avgFreq) {
      const weight = getHypothesisWeight('frequency');
      if (weight === 0) continue;
      
      const freqScore = Math.min(freq / avgFreq, 2) * 0.3;
      const contribution = freqScore * weight;
      scores[code].total += contribution;
      scores[code].contributions.push({
        patternType: 'frequency',
        patternName: `Frecuencia: ${freq}x (promedio: ${avgFreq.toFixed(1)})`,
        weight,
        contribution,
        hypothesis: hypotheses['frequency'] || null,
      });
    }
  }
  
  // ========== NORMALIZE AND BUILD RESULTS ==========
  const maxScore = Math.max(...Object.values(scores).map(s => s.total), 0.001);
  const results: ExplainablePrediction[] = [];
  
  for (const [code, scoreData] of Object.entries(scores)) {
    const normalizedScore = scoreData.total / maxScore;
    const { status, emoji } = getStatusFromScore(normalizedScore);
    const animal = getAnimalByCode(code);
    
    // Determine confidence based on number of contributing patterns
    const numPatterns = scoreData.contributions.length;
    const confidence: 'high' | 'medium' | 'low' = 
      numPatterns >= 4 ? 'high' : numPatterns >= 2 ? 'medium' : 'low';
    
    // Build reasoning
    let reasoning = '';
    const topContributions = scoreData.contributions
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);
    
    if (topContributions.length > 0) {
      reasoning = topContributions.map(c => c.patternName).join(' + ');
    } else {
      reasoning = 'Sin patrones significativos detectados';
    }
    
    // Convert to relative probability (35-98%)
    const relativeProb = Math.floor(35 + (normalizedScore * 63));
    
    results.push({
      code,
      name: animal?.name || `Número ${code}`,
      score: normalizedScore,
      relativeProb: Math.min(98, Math.max(35, relativeProb)),
      status,
      statusEmoji: emoji,
      contributions: scoreData.contributions,
      totalPatterns: numPatterns,
      isOverdue: scoreData.isOverdue,
      daysSince: scoreData.daysSince,
      confidence,
      reasoning,
    });
  }
  
  return results.sort((a, b) => b.score - a.score);
};

// Get prediction summary for display
export const getPredictionSummary = (prediction: ExplainablePrediction): string => {
  const parts: string[] = [];
  
  parts.push(`${prediction.code} ${prediction.name}`);
  parts.push(`Score: ${(prediction.score * 100).toFixed(1)}%`);
  parts.push(`Status: ${prediction.statusEmoji} ${prediction.status}`);
  parts.push(`Confianza: ${prediction.confidence}`);
  
  if (prediction.contributions.length > 0) {
    parts.push('Patrones:');
    prediction.contributions.slice(0, 3).forEach(c => {
      parts.push(`  - ${c.patternName} (${(c.contribution * 100).toFixed(1)}%)`);
    });
  }
  
  return parts.join('\n');
};
