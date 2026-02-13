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

/**
 * DEFINE EL UNIVERSO LEGAL DE CADA LOTERÍA
 * Esto evita que animales de una lotería salgan en otra.
 */
const getLegalPool = (lotteryId: string): string[] => {
  const id = lotteryId.toLowerCase();
  
  // Loterías de 38 animales (0, 00, 01-36)
  if (['lotto_activo', 'granjita', 'lotto_rey', 'selva_plus'].includes(id)) {
    const pool = ['0', '00'];
    for (let i = 1; i <= 36; i++) {
      pool.push(i.toString().padStart(2, '0'));
    }
    return pool;
  }
  
  // Guácharo Activo (37-75)
  if (id === 'guacharo' || id === 'guacharo_activo') {
    return Array.from({ length: 39 }, (_, i) => (i + 37).toString());
  }
  
  // Guacharito (76-99)
  if (id === 'guacharito') {
    return Array.from({ length: 24 }, (_, i) => (i + 76).toString());
  }

  return [];
};

// Análisis avanzado con machine learning corregido
export const analyzeAdvancedPatterns = (
  history: any[],
  lotteryId: string
): TrendAnalysis => {
  const legalPool = getLegalPool(lotteryId);
  
  // Filtramos el historial: Solo la lotería seleccionada Y números que pertenezcan a su rango legal
  const lotteryHistory = history.filter(h => 
    h.lottery_type === lotteryId && 
    legalPool.includes(h.result_number?.toString().trim())
  );

  const lottery = LOTTERIES.find(l => l.id === lotteryId);
  
  const frequencyMap = new Map<string, number>();
  const lastSeenMap = new Map<string, Date>();
  const hourlyMap = new Map<string, Map<string, number>>();
  const weekdayMap = new Map<number, Map<string, number>>();
  
  // Inicializamos el mapa de frecuencia con 0 para TODO el pool legal
  // Esto asegura que los números que NUNCA han salido se detecten como fríos correctamente
  legalPool.forEach(num => frequencyMap.set(num, 0));

  lotteryHistory.forEach(draw => {
    const num = draw.result_number?.toString().trim();
    if (!num) return;
    
    frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
    
    const drawDate = new Date(draw.created_at || draw.draw_date);
    if (!lastSeenMap.has(num) || drawDate > lastSeenMap.get(num)!) {
      lastSeenMap.set(num, drawDate);
    }
    
    const hour = draw.draw_time;
    if (!hourlyMap.has(hour)) hourlyMap.set(hour, new Map());
    const hourMap = hourlyMap.get(hour)!;
    hourMap.set(num, (hourMap.get(num) || 0) + 1);
    
    const weekday = drawDate.getDay();
    if (!weekdayMap.has(weekday)) weekdayMap.set(weekday, new Map());
    const dayMap = weekdayMap.get(weekday)!;
    dayMap.set(num, (dayMap.get(num) || 0) + 1);
  });
  
  const avgFreq = lotteryHistory.length / legalPool.length;
  const now = new Date();
  
  const hotNumbers: string[] = [];
  const coldNumbers: string[] = [];
  const overdueNumbers: string[] = [];
  
  // Clasificar basado EXCLUSIVAMENTE en el pool legal
  legalPool.forEach(num => {
    const freq = frequencyMap.get(num) || 0;
    const lastSeen = lastSeenMap.get(num);
    const daysSince = lastSeen 
      ? Math.ceil((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))
      : 99; // Si nunca ha salido, le ponemos un valor alto
    
    if (freq > avgFreq * 1.2 && freq > 0) {
      hotNumbers.push(num);
    } else if (freq < avgFreq * 0.8) {
      coldNumbers.push(num);
    }
    
    // Si es legal pero tiene mucho tiempo sin salir
    if (daysSince > 4) {
      overdueNumbers.push(num);
    }
  });
  
  // Detectar patrones limitados al pool legal
  const patterns: PatternInfo[] = detectPatterns(lotteryHistory, legalPool);
  
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
  
  const recommendation = generateRecommendation(
    hotNumbers,
    coldNumbers,
    overdueNumbers,
    patterns,
    lottery?.type === 'animals'
  );
  
  const confidence = Math.min(95, 40 + (lotteryHistory.length / 10) + (patterns.length * 5));
  
  return {
    lotteryId,
    lotteryName: lottery?.name || lotteryId,
    hotNumbers: hotNumbers.sort((a, b) => (frequencyMap.get(b) || 0) - (frequencyMap.get(a) || 0)).slice(0, 5),
    coldNumbers: coldNumbers.sort((a, b) => (frequencyMap.get(a) || 0) - (frequencyMap.get(b) || 0)).slice(0, 5),
    overdueNumbers: overdueNumbers.slice(0, 5),
    patterns,
    hourlyTrends: hourlyTrends.sort((a, b) => b.frequency - a.frequency).slice(0, 5),
    weekdayTrends: weekdayTrends.sort((a, b) => b.frequency - a.frequency),
    recommendation,
    confidence
  };
};

const detectPatterns = (history: any[], legalPool: string[]): PatternInfo[] => {
  const patterns: PatternInfo[] = [];
  const recentResults = history.slice(0, 20).map(h => h.result_number?.toString());
  
  const repeats = new Map<string, number>();
  recentResults.forEach(num => {
    if (num) repeats.set(num, (repeats.get(num) || 0) + 1);
  });
  
  repeats.forEach((count, num) => {
    if (count >= 2) {
      patterns.push({
        type: 'repeat',
        description: `El ${num} (${ANIMAL_MAPPING[num] || 'Animal'}) ha salido ${count} veces recientemente`,
        numbers: [num],
        probability: Math.min(80, 30 + count * 15)
      });
    }
  });
  
  // Gap Detection: Solo buscar números faltantes DENTRO del pool legal
  const seenInRecent = new Set(recentResults);
  const missing = legalPool.filter(num => !seenInRecent.has(num));
  
  if (missing.length > 0) {
    patterns.push({
      type: 'gap',
      description: `Animales del rango legal que no han salido recientemente: ${missing.slice(0, 3).join(', ')}`,
      numbers: missing.slice(0, 5),
      probability: 55
    });
  }
  
  return patterns.sort((a, b) => b.probability - a.probability).slice(0, 5);
};

const generateRecommendation = (
  hot: string[],
  cold: string[],
  overdue: string[],
  patterns: PatternInfo[],
  isAnimals: boolean
): string => {
  const parts: string[] = [];
  
  if (hot.length > 0) {
    const animals = isAnimals ? hot.slice(0, 2).map(n => ANIMAL_MAPPING[n]).filter(Boolean).join(', ') : '';
    parts.push(`🔥 CALIENTES: ${hot.slice(0, 2).join(', ')} ${animals ? `(${animals})` : ''}`);
  }
  
  if (overdue.length > 0) {
    const animals = isAnimals ? overdue.slice(0, 2).map(n => ANIMAL_MAPPING[n]).filter(Boolean).join(', ') : '';
    parts.push(`⏰ VENCIDOS: ${overdue.slice(0, 2).join(', ')} ${animals ? `(${animals})` : ''}`);
  }
  
  if (patterns.length > 0) {
    parts.push(`📊 TIP: ${patterns[0].description}`);
  }
  
  return parts.join(' | ') || 'Analizando tendencias...';
};

export const generateHourlyForecast = (
  history: any[],
  lotteryId: string,
  drawTime: string
): { numbers: string[]; confidence: number; reason: string } => {
  const legalPool = getLegalPool(lotteryId);
  const hourlyHistory = history.filter(
    h => h.lottery_type === lotteryId && h.draw_time === drawTime && legalPool.includes(h.result_number?.toString())
  );
  
  if (hourlyHistory.length < 3) {
    return { numbers: [], confidence: 0, reason: 'Datos insuficientes' };
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
  const confidence = Math.min(90, 30 + (hourlyHistory.length * 3));
  
  return {
    numbers,
    confidence,
    reason: `Frecuencia histórica a las ${drawTime}`
  };
};
