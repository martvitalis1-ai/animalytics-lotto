import { LOTTERIES, ANIMAL_MAPPING, DRAW_TIMES } from './constants';

export type TrendAnalysis = {
  lotteryId: string;
  lotteryName: string;
  hotNumbers: string[];
  coldNumbers: string[];
  overdueNumbers: string[];
  patterns: PatternInfo[];
  hourlyTrends: HourlyTrend[];
  weekdayTrends: WeekdayTrend[];
  recommendation: string;
  confidence: number;
};

export type PatternInfo = {
  type: 'sequence' | 'repeat' | 'mirror' | 'gap';
  description: string;
  numbers: string[];
  probability: number;
};

export type HourlyTrend = {
  hour: string;
  topNumbers: string[];
  frequency: number;
};

export type WeekdayTrend = {
  day: string;
  topNumbers: string[];
  frequency: number;
};

// Análisis avanzado con machine learning simulado
export const analyzeAdvancedPatterns = (
  history: any[],
  lotteryId: string
): TrendAnalysis => {
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const lottery = LOTTERIES.find(l => l.id === lotteryId);
  
  // Análisis de frecuencia
  const frequencyMap = new Map<string, number>();
  const lastSeenMap = new Map<string, Date>();
  const hourlyMap = new Map<string, Map<string, number>>();
  const weekdayMap = new Map<number, Map<string, number>>();
  
  lotteryHistory.forEach(draw => {
    const num = draw.result_number?.toString().trim();
    if (!num) return;
    
    // Frecuencia general
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    
    // Última vez visto
    const drawDate = new Date(draw.created_at || draw.draw_date);
    if (!lastSeenMap.has(num) || drawDate > lastSeenMap.get(num)!) {
      lastSeenMap.set(num, drawDate);
    }
    
    // Por hora
    const hour = draw.draw_time;
    if (!hourlyMap.has(hour)) hourlyMap.set(hour, new Map());
    const hourMap = hourlyMap.get(hour)!;
    hourMap.set(num, (hourMap.get(num) || 0) + 1);
    
    // Por día de semana
    const weekday = drawDate.getDay();
    if (!weekdayMap.has(weekday)) weekdayMap.set(weekday, new Map());
    const dayMap = weekdayMap.get(weekday)!;
    dayMap.set(num, (dayMap.get(num) || 0) + 1);
  });
  
  // Clasificar números
  const avgFreq = lotteryHistory.length / (lottery?.range || 36);
  const now = new Date();
  
  const hotNumbers: string[] = [];
  const coldNumbers: string[] = [];
  const overdueNumbers: string[] = [];
  
  frequencyMap.forEach((freq, num) => {
    const lastSeen = lastSeenMap.get(num);
    const daysSince = lastSeen 
      ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    if (freq > avgFreq * 1.5 && daysSince <= 3) {
      hotNumbers.push(num);
    } else if (freq < avgFreq * 0.5 || daysSince > 10) {
      coldNumbers.push(num);
    }
    
    if (daysSince > 5 && freq > 0) {
      overdueNumbers.push(num);
    }
  });
  
  // Detectar patrones
  const patterns: PatternInfo[] = detectPatterns(lotteryHistory);
  
  // Tendencias por hora
  const hourlyTrends: HourlyTrend[] = [];
  hourlyMap.forEach((numMap, hour) => {
    const sorted = Array.from(numMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    if (sorted.length > 0) {
      hourlyTrends.push({
        hour,
        topNumbers: sorted.map(([n]) => n),
        frequency: sorted.reduce((sum, [, f]) => sum + f, 0)
      });
    }
  });
  
  // Tendencias por día
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const weekdayTrends: WeekdayTrend[] = [];
  weekdayMap.forEach((numMap, day) => {
    const sorted = Array.from(numMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    weekdayTrends.push({
      day: dayNames[day],
      topNumbers: sorted.map(([n]) => n),
      frequency: sorted.reduce((sum, [, f]) => sum + f, 0)
    });
  });
  
  // Generar recomendación
  const recommendation = generateRecommendation(
    hotNumbers,
    coldNumbers,
    overdueNumbers,
    patterns,
    lottery?.type === 'animals'
  );
  
  // Calcular confianza
  const confidence = Math.min(95, 40 + (lotteryHistory.length / 10) + (patterns.length * 5));
  
  return {
    lotteryId,
    lotteryName: lottery?.name || lotteryId,
    hotNumbers: hotNumbers.slice(0, 5),
    coldNumbers: coldNumbers.slice(0, 5),
    overdueNumbers: overdueNumbers.slice(0, 5),
    patterns,
    hourlyTrends: hourlyTrends.sort((a, b) => b.frequency - a.frequency).slice(0, 5),
    weekdayTrends: weekdayTrends.sort((a, b) => b.frequency - a.frequency),
    recommendation,
    confidence
  };
};

// Detectar patrones en el historial
const detectPatterns = (history: any[]): PatternInfo[] => {
  const patterns: PatternInfo[] = [];
  const recentResults = history.slice(0, 20).map(h => h.result_number);
  
  // Detectar repeticiones
  const repeats = new Map<string, number>();
  recentResults.forEach(num => {
    repeats.set(num, (repeats.get(num) || 0) + 1);
  });
  
  repeats.forEach((count, num) => {
    if (count >= 2) {
      patterns.push({
        type: 'repeat',
        description: `El ${num} (${ANIMAL_MAPPING[num] || 'Número'}) ha salido ${count} veces en los últimos 20 sorteos`,
        numbers: [num],
        probability: Math.min(80, 30 + count * 15)
      });
    }
  });
  
  // Detectar secuencias
  for (let i = 0; i < recentResults.length - 2; i++) {
    const a = parseInt(recentResults[i]);
    const b = parseInt(recentResults[i + 1]);
    const c = parseInt(recentResults[i + 2]);
    
    if (!isNaN(a) && !isNaN(b) && !isNaN(c)) {
      if (b === a + 1 && c === b + 1) {
        patterns.push({
          type: 'sequence',
          description: `Secuencia ascendente detectada: ${a}-${b}-${c}`,
          numbers: [a.toString(), b.toString(), c.toString()],
          probability: 45
        });
      }
    }
  }
  
  // Detectar gaps (números que no han salido en mucho tiempo)
  const allNumbers = new Set(recentResults);
  const missing: string[] = [];
  for (let i = 0; i <= 36; i++) {
    if (!allNumbers.has(i.toString()) && !allNumbers.has(i.toString().padStart(2, '0'))) {
      missing.push(i.toString());
    }
  }
  
  if (missing.length > 0 && missing.length <= 10) {
    patterns.push({
      type: 'gap',
      description: `Números que no han salido recientemente: ${missing.slice(0, 5).join(', ')}`,
      numbers: missing.slice(0, 5),
      probability: 55
    });
  }
  
  return patterns.sort((a, b) => b.probability - a.probability).slice(0, 5);
};

// Generar recomendación en texto
const generateRecommendation = (
  hot: string[],
  cold: string[],
  overdue: string[],
  patterns: PatternInfo[],
  isAnimals: boolean
): string => {
  const parts: string[] = [];
  
  if (hot.length > 0) {
    const animals = isAnimals ? hot.map(n => ANIMAL_MAPPING[n]).filter(Boolean).join(', ') : '';
    parts.push(`🔥 CALIENTES: ${hot.slice(0, 3).join(', ')}${animals ? ` (${animals})` : ''} - Han estado saliendo con frecuencia.`);
  }
  
  if (overdue.length > 0) {
    const animals = isAnimals ? overdue.slice(0, 3).map(n => ANIMAL_MAPPING[n]).filter(Boolean).join(', ') : '';
    parts.push(`⏰ VENCIDOS: ${overdue.slice(0, 3).join(', ')}${animals ? ` (${animals})` : ''} - Estadísticamente les toca.`);
  }
  
  if (patterns.length > 0) {
    const bestPattern = patterns[0];
    parts.push(`📊 PATRÓN: ${bestPattern.description} (${bestPattern.probability}% probabilidad).`);
  }
  
  return parts.join('\n\n') || 'Analizando datos... Se necesitan más resultados para generar recomendaciones precisas.';
};

// Generar pronóstico por hora específica
export const generateHourlyForecast = (
  history: any[],
  lotteryId: string,
  drawTime: string
): { numbers: string[]; confidence: number; reason: string } => {
  const hourlyHistory = history.filter(
    h => h.lottery_type === lotteryId && h.draw_time === drawTime
  );
  
  if (hourlyHistory.length < 5) {
    return {
      numbers: [],
      confidence: 0,
      reason: 'Datos insuficientes para esta hora'
    };
  }
  
  const frequencyMap = new Map<string, number>();
  hourlyHistory.forEach(h => {
    const num = h.result_number;
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
  });
  
  const sorted = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const numbers = sorted.map(([n]) => n);
  const confidence = Math.min(90, 30 + (hourlyHistory.length * 2));
  
  const lottery = LOTTERIES.find(l => l.id === lotteryId);
  const animalsText = lottery?.type === 'animals'
    ? numbers.map(n => `${n}(${ANIMAL_MAPPING[n]})`).join(', ')
    : numbers.join(', ');
  
  return {
    numbers,
    confidence,
    reason: `Basado en ${hourlyHistory.length} sorteos a las ${drawTime}. Números más frecuentes: ${animalsText}`
  };
};
