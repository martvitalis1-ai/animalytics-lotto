import { LOTTERIES, ANIMAL_MAPPING } from './constants';

export type AnalysisResult = {
  number: string;
  animal: string;
  probability: number;
  status: 'HOT' | 'COLD' | 'OVERDUE' | 'NEUTRAL';
  frequency: number;
  daysSince: number;
  lastDrawTime?: string;
};

export const calculateProbabilities = (history: any[], lotteryId: string): AnalysisResult[] => {
  const config = LOTTERIES.find(l => l.id === lotteryId);
  const specificHistory = history.filter(h => h.lottery_type === lotteryId);
  const frequencyMap = new Map<string, number>();
  const lastSeenMap = new Map<string, { date: Date; time: string }>();
  const now = new Date();

  specificHistory.forEach((draw) => {
    let num = draw.result_number?.toString().trim();
    if (!num) return;
    
    if (config?.type === 'animals' && num !== '00' && !isNaN(parseInt(num))) {
      num = parseInt(num).toString();
    }
    
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    
    const drawDate = new Date(draw.created_at || draw.draw_date);
    const existing = lastSeenMap.get(num);
    if (!existing || drawDate > existing.date) {
      lastSeenMap.set(num, { date: drawDate, time: draw.draw_time });
    }
  });

  const results: AnalysisResult[] = [];
  let universe: string[] = [];

  if (config?.type === 'animals') {
    universe = ['00', ...Array.from({ length: 37 }, (_, i) => i.toString())];
  } else {
    const max = config?.range || 75;
    universe = Array.from({ length: max + 1 }, (_, i) => i.toString());
    if (config?.id === 'guacharo' || config?.id === 'guacharito') {
      if (!universe.includes('00')) universe.unshift('00');
    }
  }

  const totalDraws = specificHistory.length || 1;
  const avgFreq = totalDraws / universe.length;

  universe.forEach((numStr) => {
    const freq = frequencyMap.get(numStr) || 0;
    const lastSeen = lastSeenMap.get(numStr);
    let daysSince = lastSeen 
      ? Math.ceil(Math.abs(now.getTime() - lastSeen.date.getTime()) / (1000 * 60 * 60 * 24)) 
      : 30;

    // Algoritmo de probabilidad mejorado
    const frequencyScore = freq / totalDraws * 100;
    const overdueBonus = Math.min(daysSince * 2, 50);
    const recentPenalty = daysSince < 2 ? -20 : 0;
    
    let score = frequencyScore + overdueBonus + recentPenalty;

    // Determinar estado
    let status: AnalysisResult['status'] = 'NEUTRAL';
    if (daysSince > 5 && freq > 0) status = 'OVERDUE';
    else if (freq > avgFreq * 1.5) status = 'HOT';
    else if (freq === 0 || freq < avgFreq * 0.3) status = 'COLD';

    const animal = config?.type === 'animals' 
      ? (ANIMAL_MAPPING[numStr] || 'Desconocido') 
      : `Número ${numStr.padStart(2, '0')}`;

    results.push({
      number: numStr,
      animal,
      probability: Math.max(0, score),
      status,
      frequency: freq,
      daysSince,
      lastDrawTime: lastSeen?.time
    });
  });

  return results.sort((a, b) => b.probability - a.probability);
};

export const generateHourlyPredictions = (history: any[], lotteryId: string, drawTime: string): AnalysisResult[] => {
  const config = LOTTERIES.find(l => l.id === lotteryId);
  const hourlyHistory = history.filter(h => 
    h.lottery_type === lotteryId && h.draw_time === drawTime
  );
  
  return calculateProbabilities(
    hourlyHistory.map(h => ({ ...h, lottery_type: lotteryId })), 
    lotteryId
  ).slice(0, 5);
};
