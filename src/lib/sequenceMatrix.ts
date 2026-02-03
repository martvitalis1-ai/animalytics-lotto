// ============================================================
// SEQUENCE MATRIX ENGINE - Infinite Historical Successor Analysis
// Analyzes NUMBER -> SUCCESSORS patterns from full history
// NO LIMITS - Uses complete data since 2026-01-02
// Persists to Supabase, NOT localStorage
// ============================================================

import { supabase } from '@/integrations/supabase/client';
import { LEARNING_START_DATE } from './hypothesisEngine';
import { getMaxNumberForLottery, getAnimalName } from './animalData';

export interface SuccessorEntry {
  code: string;
  count: number;
  percentage: number;
}

export interface SequenceRow {
  number: string;
  successors: SuccessorEntry[];
  rawSequence: string; // Format: "05/22/03/01/36..."
  totalOccurrences: number;
}

export interface SequenceMatrix {
  lotteryId: string;
  lastUpdated: string;
  totalDraws: number;
  rows: SequenceRow[];
}

// Calculate successor sequence for a number from full history
export const calculateSuccessorSequence = (
  number: string,
  history: any[],
  lotteryId: string
): SuccessorEntry[] => {
  const successorCounts: Record<string, number> = {};
  let totalSuccessors = 0;

  // Sort by date and time to ensure correct order
  const sortedHistory = [...history]
    .filter(h => h.lottery_type === lotteryId)
    .sort((a, b) => {
      const dateCompare = new Date(a.draw_date).getTime() - new Date(b.draw_date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.draw_time.localeCompare(b.draw_time);
    });

  // Find all occurrences and their successors
  for (let i = 0; i < sortedHistory.length - 1; i++) {
    const current = sortedHistory[i].result_number?.toString().trim();
    const next = sortedHistory[i + 1].result_number?.toString().trim();

    // Normalize comparison (handle "0" vs "00")
    const normalizedCurrent = current === '00' ? '00' : parseInt(current).toString();
    const normalizedNumber = number === '00' ? '00' : parseInt(number).toString();

    if (normalizedCurrent === normalizedNumber && next) {
      const normalizedNext = next === '00' ? '00' : next.padStart(2, '0');
      successorCounts[normalizedNext] = (successorCounts[normalizedNext] || 0) + 1;
      totalSuccessors++;
    }
  }

  // Convert to array with percentages
  return Object.entries(successorCounts)
    .map(([code, count]) => ({
      code,
      count,
      percentage: totalSuccessors > 0 ? Math.round((count / totalSuccessors) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

// Generate raw sequence string (e.g., "05/22/03/01/36...")
export const generateRawSequence = (successors: SuccessorEntry[], maxItems: number = 20): string => {
  return successors
    .slice(0, maxItems)
    .map(s => s.code.padStart(2, '0'))
    .join('/');
};

// Build complete sequence matrix for a lottery - NO LIMITS
export const buildSequenceMatrix = async (
  lotteryId: string,
  history?: any[]
): Promise<SequenceMatrix> => {
  // If history not provided, fetch from database (NO LIMITS)
  let historyData = history;
  
  if (!historyData) {
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('lottery_type', lotteryId)
      .gte('draw_date', LEARNING_START_DATE)
      .order('draw_date', { ascending: true })
      .order('draw_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching history for matrix:', error);
      return {
        lotteryId,
        lastUpdated: new Date().toISOString(),
        totalDraws: 0,
        rows: [],
      };
    }
    
    historyData = data || [];
    console.log(`[SequenceMatrix] Loaded ${historyData.length} results for ${lotteryId} (NO LIMIT)`);
  }

  const filteredHistory = historyData.filter(h => h.lottery_type === lotteryId);
  const maxNumber = getMaxNumberForLottery(lotteryId);
  const rows: SequenceRow[] = [];

  // Generate all codes including "00"
  const allCodes = ['0', '00'];
  for (let i = 1; i <= maxNumber; i++) {
    allCodes.push(i.toString());
  }

  for (const code of allCodes) {
    const successors = calculateSuccessorSequence(code, filteredHistory, lotteryId);
    const occurrences = filteredHistory.filter(h => {
      const num = h.result_number?.toString().trim();
      const normalized = num === '00' ? '00' : parseInt(num).toString();
      const normalizedCode = code === '00' ? '00' : parseInt(code).toString();
      return normalized === normalizedCode;
    }).length;

    if (occurrences > 0) {
      rows.push({
        number: code.padStart(2, '0'),
        successors,
        rawSequence: generateRawSequence(successors),
        totalOccurrences: occurrences,
      });
    }
  }

  // Sort by number
  rows.sort((a, b) => {
    if (a.number === '00') return 1;
    if (b.number === '00') return -1;
    return parseInt(a.number) - parseInt(b.number);
  });

  return {
    lotteryId,
    lastUpdated: new Date().toISOString(),
    totalDraws: filteredHistory.length,
    rows,
  };
};

// Get predicted successors for a number based on history
export const getPredictedSuccessors = (
  lastNumber: string,
  history: any[],
  lotteryId: string,
  topN: number = 5
): { code: string; name: string; probability: number }[] => {
  const successors = calculateSuccessorSequence(lastNumber, history, lotteryId);
  
  return successors.slice(0, topN).map(s => ({
    code: s.code,
    name: getAnimalName(s.code, lotteryId),
    probability: s.percentage,
  }));
};

// Format matrix row for display
export const formatMatrixRow = (row: SequenceRow, lotteryId: string): string => {
  const animalName = getAnimalName(row.number, lotteryId);
  const topSuccessors = row.successors.slice(0, 10)
    .map(s => `${s.code}(${s.count})`)
    .join('/');
  
  return `${row.number}=${animalName}: ${topSuccessors}`;
};

// Get matrix summary for a lottery
export const getMatrixSummary = async (
  lotteryId: string,
  history?: any[]
): Promise<string> => {
  const matrix = await buildSequenceMatrix(lotteryId, history);
  
  let summary = `📊 MATRIZ DE SECUENCIA - ${lotteryId.toUpperCase()}\n`;
  summary += `📅 Datos desde ${LEARNING_START_DATE} (${matrix.totalDraws} sorteos)\n\n`;
  
  for (const row of matrix.rows.slice(0, 20)) {
    summary += `${row.number}=${row.rawSequence}\n`;
  }
  
  if (matrix.rows.length > 20) {
    summary += `\n... y ${matrix.rows.length - 20} más`;
  }
  
  return summary;
};

// Analyze patterns: which numbers tend to follow each other
export const analyzeSuccessorPatterns = async (
  lotteryId: string,
  history: any[]
): Promise<{
  hotPairs: { from: string; to: string; count: number }[];
  coldNumbers: string[];
  streakNumbers: string[];
}> => {
  const matrix = await buildSequenceMatrix(lotteryId, history);
  const pairs: { from: string; to: string; count: number }[] = [];
  const coldNumbers: string[] = [];
  const streakNumbers: string[] = [];

  for (const row of matrix.rows) {
    // Find hot pairs
    for (const successor of row.successors.slice(0, 3)) {
      if (successor.count >= 3) {
        pairs.push({
          from: row.number,
          to: successor.code,
          count: successor.count,
        });
      }
    }

    // Check for self-succession (streaks)
    const selfSuccessor = row.successors.find(s => s.code === row.number);
    if (selfSuccessor && selfSuccessor.count >= 2) {
      streakNumbers.push(row.number);
    }

    // Find cold numbers (low occurrence)
    if (row.totalOccurrences < 5) {
      coldNumbers.push(row.number);
    }
  }

  // Sort pairs by frequency
  pairs.sort((a, b) => b.count - a.count);

  return {
    hotPairs: pairs.slice(0, 20),
    coldNumbers,
    streakNumbers,
  };
};
