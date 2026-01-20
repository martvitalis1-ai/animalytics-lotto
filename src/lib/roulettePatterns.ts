// ============================================================
// ROULETTE PATTERNS ENGINE - Spatial analysis for circular lotteries
// Supports 38, 75, and 99 position wheels
// ============================================================

export type RouletteType = 'standard' | 'guacharo' | 'guacharito';

export interface RouletteConfig {
  size: number;
  hasDoubleZero: boolean;
  positions: string[];
}

export interface SpatialCandidate {
  code: string;
  source: string;
  weight: number;
  distance: number;
}

// Generate circular position array for a roulette
export const generateRoulettePositions = (size: number): string[] => {
  const positions: string[] = [];
  
  // 0 at top (index 0)
  positions.push("0");
  
  // Generate positions from 1 to size-1 (excluding 00 which goes at opposite)
  for (let i = 1; i < size; i++) {
    if (i === Math.floor(size / 2)) {
      // 00 at exactly opposite position (180°)
      positions.push("00");
    }
    positions.push(i.toString());
  }
  
  return positions;
};

// Roulette configurations
export const ROULETTE_CONFIGS: Record<RouletteType, RouletteConfig> = {
  standard: {
    size: 38,
    hasDoubleZero: true,
    positions: generateRoulettePositions(38),
  },
  guacharo: {
    size: 76,
    hasDoubleZero: true,
    positions: generateRoulettePositions(76),
  },
  guacharito: {
    size: 100,
    hasDoubleZero: true,
    positions: generateRoulettePositions(100),
  },
};

// Get roulette type from lottery ID
export const getRouletteType = (lotteryId: string): RouletteType => {
  if (lotteryId === 'guacharo') return 'guacharo';
  if (lotteryId === 'guacharito') return 'guacharito';
  return 'standard';
};

// Get position index of a number in the roulette
export const getPositionIndex = (code: string, config: RouletteConfig): number => {
  const index = config.positions.indexOf(code);
  if (index === -1) {
    // Try numeric match
    const numericCode = code.replace(/^0+/, '') || '0';
    return config.positions.findIndex(p => p === numericCode || parseInt(p) === parseInt(code));
  }
  return index;
};

// Get code at a position index (handles circular wrapping)
export const getCodeAtPosition = (index: number, config: RouletteConfig): string => {
  const normalizedIndex = ((index % config.size) + config.size) % config.size;
  return config.positions[normalizedIndex] || "0";
};

// Get opposite number (180°)
export const getOppositeNumber = (code: string, config: RouletteConfig): string => {
  const currentPos = getPositionIndex(code, config);
  if (currentPos === -1) return "0";
  
  const oppositePos = (currentPos + Math.floor(config.size / 2)) % config.size;
  return getCodeAtPosition(oppositePos, config);
};

// Get neighbors at specific distances
export const getNeighbors = (
  code: string, 
  distances: number[], 
  config: RouletteConfig
): SpatialCandidate[] => {
  const currentPos = getPositionIndex(code, config);
  if (currentPos === -1) return [];
  
  const candidates: SpatialCandidate[] = [];
  
  for (const distance of distances) {
    // Positive direction
    const posCandidate = getCodeAtPosition(currentPos + distance, config);
    candidates.push({
      code: posCandidate,
      source: `Vecino +${distance} de ${code}`,
      weight: 1 / Math.abs(distance),
      distance,
    });
    
    // Negative direction
    const negCandidate = getCodeAtPosition(currentPos - distance, config);
    candidates.push({
      code: negCandidate,
      source: `Vecino -${distance} de ${code}`,
      weight: 1 / Math.abs(distance),
      distance: -distance,
    });
  }
  
  return candidates;
};

// Generate all spatial candidates from a base number
export const generateSpatialCandidates = (
  lastNumber: string,
  lotteryId: string
): SpatialCandidate[] => {
  const rouletteType = getRouletteType(lotteryId);
  const config = ROULETTE_CONFIGS[rouletteType];
  
  const candidates: SpatialCandidate[] = [];
  const standardDistances = [1, 5, 7, 9];
  
  // Neighbors of the last number
  candidates.push(...getNeighbors(lastNumber, standardDistances, config));
  
  // Opposite number
  const opposite = getOppositeNumber(lastNumber, config);
  candidates.push({
    code: opposite,
    source: `Opuesto de ${lastNumber}`,
    weight: 0.8,
    distance: Math.floor(config.size / 2),
  });
  
  // Neighbors of the opposite
  candidates.push(...getNeighbors(opposite, standardDistances, config).map(c => ({
    ...c,
    source: `${c.source} (desde opuesto)`,
    weight: c.weight * 0.7,
  })));
  
  // Deduplicate
  const seen = new Set<string>();
  return candidates.filter(c => {
    if (seen.has(c.code)) return false;
    seen.add(c.code);
    return true;
  });
};

// Mathematical operations between numbers
export const calculateMathPatterns = (
  results: string[]
): { code: string; formula: string; weight: number }[] => {
  const patterns: { code: string; formula: string; weight: number }[] = [];
  
  if (results.length < 2) return patterns;
  
  const nums = results.slice(0, 4).map(r => parseInt(r) || 0);
  
  // Operations between 2 consecutive numbers
  if (nums.length >= 2) {
    const sum2 = (nums[0] + nums[1]) % 100;
    patterns.push({ code: sum2.toString(), formula: `Σ(${nums[0]}+${nums[1]})`, weight: 0.6 });
    
    const diff2 = Math.abs(nums[0] - nums[1]) % 100;
    patterns.push({ code: diff2.toString(), formula: `Δ(${nums[0]}-${nums[1]})`, weight: 0.5 });
  }
  
  // Operations between 3 consecutive numbers
  if (nums.length >= 3) {
    const sum3 = (nums[0] + nums[1] + nums[2]) % 100;
    patterns.push({ code: sum3.toString(), formula: `Σ(${nums[0]}+${nums[1]}+${nums[2]})`, weight: 0.55 });
    
    const avg3 = Math.round((nums[0] + nums[1] + nums[2]) / 3) % 100;
    patterns.push({ code: avg3.toString(), formula: `μ(${nums[0]},${nums[1]},${nums[2]})`, weight: 0.4 });
  }
  
  // Operations between 4 consecutive numbers
  if (nums.length >= 4) {
    const sum4 = (nums[0] + nums[1] + nums[2] + nums[3]) % 100;
    patterns.push({ code: sum4.toString(), formula: `Σ4(${nums.slice(0, 4).join('+')})`, weight: 0.5 });
  }
  
  // Digit operations
  if (nums.length >= 1) {
    // Sum of digits
    const digitSum = nums[0].toString().split('').reduce((a, d) => a + parseInt(d), 0);
    patterns.push({ code: digitSum.toString(), formula: `DigSum(${nums[0]})`, weight: 0.45 });
    
    // Digital root
    let digitalRoot = nums[0];
    while (digitalRoot > 9) {
      digitalRoot = digitalRoot.toString().split('').reduce((a, d) => a + parseInt(d), 0);
    }
    patterns.push({ code: digitalRoot.toString(), formula: `DigRoot(${nums[0]})`, weight: 0.4 });
  }
  
  // Cross combinations
  if (nums.length >= 2) {
    const d1 = nums[0] % 10;
    const d2 = nums[1] % 10;
    const cross = (d1 * 10 + d2) % 100;
    patterns.push({ code: cross.toString(), formula: `Cross(${d1}${d2})`, weight: 0.35 });
  }
  
  return patterns;
};

// Calculate overdue numbers
export const calculateOverdueNumbers = (
  history: any[],
  lotteryId: string,
  maxNumber: number,
  thresholdDays: number = 7
): { code: string; daysSince: number; weight: number }[] => {
  const now = new Date();
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  
  const lastSeen: Record<string, Date> = {};
  
  for (const draw of lotteryHistory) {
    const num = draw.result_number?.toString().trim();
    const date = new Date(draw.created_at || draw.draw_date);
    
    if (!lastSeen[num] || date > lastSeen[num]) {
      lastSeen[num] = date;
    }
  }
  
  const overdue: { code: string; daysSince: number; weight: number }[] = [];
  
  // Check all numbers including 0 and 00
  const allCodes = ["0", "00"];
  for (let i = 1; i <= maxNumber; i++) {
    allCodes.push(i.toString());
  }
  
  for (const code of allCodes) {
    const lastSeenDate = lastSeen[code];
    const daysSince = lastSeenDate 
      ? Math.ceil((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30; // Default if never seen
    
    if (daysSince >= thresholdDays) {
      overdue.push({
        code,
        daysSince,
        weight: Math.min(daysSince / 30, 1) * 0.9, // Cap at 1
      });
    }
  }
  
  return overdue.sort((a, b) => b.daysSince - a.daysSince);
};

// Best hours analysis
export const analyzeBestHours = (
  history: any[],
  lotteryId: string,
  code: string
): { time: string; frequency: number; percentage: number }[] => {
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  
  const hourlyCount: Record<string, number> = {};
  const hourlyTotal: Record<string, number> = {};
  
  for (const draw of lotteryHistory) {
    const time = draw.draw_time;
    const num = draw.result_number?.toString().trim();
    
    hourlyTotal[time] = (hourlyTotal[time] || 0) + 1;
    
    if (num === code || (code !== "00" && parseInt(num) === parseInt(code))) {
      hourlyCount[time] = (hourlyCount[time] || 0) + 1;
    }
  }
  
  return Object.entries(hourlyCount)
    .map(([time, count]) => ({
      time,
      frequency: count,
      percentage: hourlyTotal[time] ? Math.round((count / hourlyTotal[time]) * 100) : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency);
};

// Best days analysis
export const analyzeBestDays = (
  history: any[],
  lotteryId: string,
  code: string
): { day: string; frequency: number; percentage: number }[] => {
  const lotteryHistory = history.filter(h => h.lottery_type === lotteryId);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  const dayCount: Record<string, number> = {};
  const dayTotal: Record<string, number> = {};
  
  for (const draw of lotteryHistory) {
    const date = new Date(draw.draw_date || draw.created_at);
    const dayName = dayNames[date.getDay()];
    const num = draw.result_number?.toString().trim();
    
    dayTotal[dayName] = (dayTotal[dayName] || 0) + 1;
    
    if (num === code || (code !== "00" && parseInt(num) === parseInt(code))) {
      dayCount[dayName] = (dayCount[dayName] || 0) + 1;
    }
  }
  
  return Object.entries(dayCount)
    .map(([day, count]) => ({
      day,
      frequency: count,
      percentage: dayTotal[day] ? Math.round((count / dayTotal[day]) * 100) : 0,
    }))
    .sort((a, b) => b.frequency - a.frequency);
};
