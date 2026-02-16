// ============================================================
// ANIMAL DATA - Complete Official Mappings for Venezuelan Lotteries
// Corrected: 20=COCHINO, 49=PEREZOSO, 76-99=Official User List
// Ranges: 0-36 (Lotto Activo, Granjita, Selva, LottoRey)
//         0-75 (Guácharo Activo)
//         0-99 (Guacharito)
// ============================================================

export interface AnimalInfo {
  id: number;
  code: string;  // String to properly handle "0" vs "00"
  name: string;
  category: string;
}

// ============================================================
// OFFICIAL MAPPINGS BY LOTTERY TYPE
// ============================================================

// LOTTO ACTIVO, GRANJITA, SELVA PLUS, LOTTO REY (0, 00 to 36)
export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN',
  '00': 'BALLENA',
  '1': 'CARNERO',
  '2': 'TORO',
  '3': 'CIEMPIÉS',
  '4': 'ALACRÁN',
  '5': 'LEÓN',
  '6': 'RANA',
  '7': 'PERICO',
  '8': 'RATÓN',
  '9': 'ÁGUILA',
  '10': 'TIGRE',
  '11': 'GATO',
  '12': 'CABALLO',
  '13': 'MONO',
  '14': 'PALOMA',
  '15': 'ZORRO',
  '16': 'OSO',
  '17': 'PAVO',
  '18': 'BURRO',
  '19': 'CHIVO',
  '20': 'COCHINO',
  '21': 'GALLO',
  '22': 'CAMELLO',
  '23': 'CEBRA',
  '24': 'IGUANA',
  '25': 'GALLINA',
  '26': 'VACA',
  '27': 'PERRO',
  '28': 'ZAMURO',
  '29': 'ELEFANTE',
  '30': 'CAIMÁN',
  '31': 'LAPA',
  '32': 'ARDILLA',
  '33': 'PESCADO',
  '34': 'VENADO',
  '35': 'JIRAFA',
  '36': 'CULEBRA',
};

// GUÁCHARO ACTIVO (0, 00 to 75)
export const ANIMALS_GUACHARO: Record<string, string> = {
  ...ANIMALS_STANDARD,
  '37': 'TORTUGA',
  '38': 'BÚFALO',
  '39': 'LECHUZA',
  '40': 'AVISPA',
  '41': 'CANGURO',
  '42': 'TUCÁN',
  '43': 'MARIPOSA',
  '44': 'CHIGÜIRE',
  '45': 'GARZA',
  '46': 'PUMA',
  '47': 'PAVO REAL',
  '48': 'PUERCOESPÍN',
  '49': 'PEREZOSO',
  '50': 'CANARIO',
  '51': 'PELÍCANO',
  '52': 'PULPO',
  '53': 'CARACOL',
  '54': 'GRILLO',
  '55': 'OSO HORMIGUERO',
  '56': 'TIBURÓN',
  '57': 'PATO',
  '58': 'HORMIGA',
  '59': 'PANTERA',
  '60': 'CAMALEÓN',
  '61': 'PANDA',
  '62': 'CACHICAMO',
  '63': 'CANGREJO',
  '64': 'GAVILÁN',
  '65': 'ARAÑA',
  '66': 'LOBO',
  '67': 'AVESTRUZ',
  '68': 'JAGUAR',
  '69': 'CONEJO',
  '70': 'BISONTE',
  '71': 'GUACAMAYA',
  '72': 'GORILA',
  '73': 'HIPOPÓTAMO',
  '74': 'TURPIAL',
  '75': 'GUÁCHARO',
};

// GUACHARITO (0, 00 to 99) - UPDATED NAMES FROM USER LIST
export const ANIMALS_GUACHARITO: Record<string, string> = {
  ...ANIMALS_GUACHARO,
  '76': 'RINOCERONTE',
  '77': 'PINGÜINO',
  '78': 'ANTÍLOPE',
  '79': 'CALAMAR',
  '80': 'MURCIÉLAGO',
  '81': 'CUERVO',
  '82': 'CUCARACHA',
  '83': 'BÚHO',
  '84': 'CAMARÓN',
  '85': 'HÁMSTER',
  '86': 'BUEY',
  '87': 'CABRA',
  '88': 'ERIZO DE MAR',
  '89': 'ANGUILA',
  '90': 'HURÓN',
  '91': 'MORROCOY',
  '92': 'CISNE',
  '93': 'GAVIOTA',
  '94': 'PAUJÍ',
  '95': 'ESCARABAJO',
  '96': 'CABALLITO DE MAR',
  '97': 'LORO',
  '98': 'COCODRILO',
  '99': 'GUACHARITO',
};

// Get the correct mapping for a lottery
export const getAnimalMappingForLottery = (lotteryId: string): Record<string, string> => {
  if (lotteryId === 'guacharito') return ANIMALS_GUACHARITO;
  if (lotteryId === 'guacharo') return ANIMALS_GUACHARO;
  return ANIMALS_STANDARD;
};

// Master array with full 0-99 support + "00" Ballena distinction
export const ANIMALS_DATA: AnimalInfo[] = Object.entries(ANIMALS_GUACHARITO).map(([code, name]) => ({
  id: code === '00' ? 100 : parseInt(code) || 0,
  code,
  name,
  category: getCategoryForAnimal(name),
}));

// Helper to get category
function getCategoryForAnimal(name: string): string {
  const categories: Record<string, string[]> = {
    acuatico: ['DELFÍN', 'BALLENA', 'RANA', 'PESCADO', 'TIBURÓN', 'PULPO', 'CANGREJO', 'ANGUILA', 'CABALLITO DE MAR', 'PINGÜINO', 'ERIZO DE MAR', 'CALAMAR', 'CISNE'],
    ave: ['PERICO', 'ÁGUILA', 'PALOMA', 'PAVO', 'GALLO', 'GALLINA', 'ZAMURO', 'LECHUZA', 'TUCÁN', 'GARZA', 'PAVO REAL', 'CANARIO', 'PELÍCANO', 'PATO', 'GAVILÁN', 'AVESTRUZ', 'GUACAMAYA', 'TURPIAL', 'GUÁCHARO', 'CUERVO', 'BÚHO', 'GAVIOTA', 'PAUJÍ', 'LORO'],
    granja: ['CARNERO', 'TORO', 'CABALLO', 'BURRO', 'CHIVO', 'COCHINO', 'VACA', 'BUEY', 'CABRA'],
    selva: ['LEÓN', 'TIGRE', 'MONO', 'ZORRO', 'OSO', 'CEBRA', 'ELEFANTE', 'JIRAFA', 'BÚFALO', 'PUMA', 'PANTERA', 'JAGUAR', 'BISONTE', 'GORILA', 'HIPOPÓTAMO', 'LOBO', 'RINOCERONTE'],
    insecto: ['CIEMPIÉS', 'ALACRÁN', 'AVISPA', 'MARIPOSA', 'GRILLO', 'HORMIGA', 'ARAÑA', 'CUCARACHA', 'ESCARABAJO'],
    reptil: ['IGUANA', 'CAIMÁN', 'CULEBRA', 'TORTUGA', 'CAMALEÓN', 'MORROCOY', 'COCODRILO'],
    silvestre: ['LAPA', 'ARDILLA', 'VENADO', 'CHIGÜIRE', 'PUERCOESPÍN', 'PEREZOSO', 'OSO HORMIGUERO', 'CACHICAMO', 'MURCIÉLAGO', 'HURÓN', 'HÁMSTER'],
    exotico: ['CAMELLO', 'CANGURO', 'PANDA', 'ANTÍLOPE'],
    domestico: ['GATO', 'PERRO', 'RATÓN', 'CONEJO', 'GUACHARITO'],
    molusco: ['CARACOL'],
  };
  
  for (const [cat, animals] of Object.entries(categories)) {
    if (animals.includes(name)) return cat;
  }
  return 'otro';
}

// Create lookup map for fast access by code (string)
const ANIMAL_BY_CODE = new Map<string, AnimalInfo>();
ANIMALS_DATA.forEach(animal => {
  ANIMAL_BY_CODE.set(animal.code, animal);
});

// Get animal by code (string comparison for 0/00 distinction)
export const getAnimalByCode = (code: string, lotteryId?: string): AnimalInfo | undefined => {
  const normalizedCode = code?.toString().trim();
  if (!normalizedCode) return undefined;
  
  if (lotteryId) {
    const mapping = getAnimalMappingForLottery(lotteryId);
    const name = mapping[normalizedCode] || mapping[parseInt(normalizedCode).toString()];
    if (name) {
      return {
        id: normalizedCode === '00' ? 100 : parseInt(normalizedCode) || 0,
        code: normalizedCode,
        name,
        category: getCategoryForAnimal(name),
      };
    }
  }
  
  if (normalizedCode === '0' || normalizedCode === '00') {
    return ANIMAL_BY_CODE.get(normalizedCode);
  }
  
  const numericCode = parseInt(normalizedCode).toString();
  return ANIMAL_BY_CODE.get(numericCode);
};

// Get animal name from code
export const getAnimalName = (code: string, lotteryId?: string): string => {
  const animal = getAnimalByCode(code, lotteryId);
  return animal?.name || `Número ${code}`;
};

// Get codes for specific lottery ranges
export const getCodesForLottery = (lotteryId: string): string[] => {
  if (lotteryId === 'guacharo') {
    return ['0', '00', ...Array.from({ length: 75 }, (_, i) => (i + 1).toString())];
  }
  if (lotteryId === 'guacharito') {
    return ['0', '00', ...Array.from({ length: 99 }, (_, i) => (i + 1).toString())];
  }
  return ['0', '00', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];
};

// Get max number for lottery
export const getMaxNumberForLottery = (lotteryId: string): number => {
  if (lotteryId === 'guacharito') return 99;
  if (lotteryId === 'guacharo') return 75;
  return 36;
};

// Emoji mapping for visual representation
export const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛",
  "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭",
  "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵",
  "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏",
  "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓",
  "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅",
  "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟",
  "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬",
  "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋",
  "44": "🦫", "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔",
  "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌",
  "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜",
  "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀",
  "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆",
  "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛",
  "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌",
  "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦌",
  "84": "🦂", "85": "🐋", "86": "🐂", "87": "🦭", "88": "🐧",
  "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🦩",
  "94": "🐦", "95": "🐆", "96": "🐠", "97": "🦜", "98": "🐊",
  "99": "🐣",
};

// Get emoji for animal code
export const getAnimalEmoji = (code: string): string => {
  const normalizedCode = code?.toString().trim();
  if (!normalizedCode) return "❓";
  if (normalizedCode === "0" || normalizedCode === "00") {
    return ANIMAL_EMOJIS[normalizedCode] || "❓";
  }
  const numericCode = parseInt(normalizedCode).toString();
  return ANIMAL_EMOJIS[numericCode] || "🔢";
};

// Sprite coordinates mapping (row, column in the sprite sheet)
export const SPRITE_POSITIONS: Record<string, { row: number; col: number }> = {
  "0": { row: 0, col: 0 },   // Delfín
  "00": { row: 0, col: 1 },  // Ballena
  "1": { row: 0, col: 2 },   // Carnero
  "2": { row: 0, col: 3 },   // Toro
  "3": { row: 0, col: 4 },   // Ciempiés
  "4": { row: 1, col: 0 },   // Alacrán
  "5": { row: 1, col: 1 },   // León
  "6": { row: 1, col: 2 },   // Rana
  "7": { row: 1, col: 3 },   // Perico
  "8": { row: 1, col: 4 },   // Ratón
  "9": { row: 2, col: 0 },   // Águila
  "10": { row: 2, col: 1 },  // Tigre
  "11": { row: 2, col: 2 },  // Gato
  "12": { row: 2, col: 3 },  // Caballo
  "13": { row: 2, col: 4 },  // Mono
  "14": { row: 3, col: 0 },  // Paloma
  "15": { row: 3, col: 1 },  // Zorro
  "16": { row: 3, col: 2 },  // Oso
  "17": { row: 3, col: 3 },  // Pavo
  "18": { row: 3, col: 4 },  // Burro
  "19": { row: 4, col: 0 },  // Chivo
  "20": { row: 4, col: 1 },  // Cochino
  "21": { row: 4, col: 2 },  // Gallo
  "22": { row: 4, col: 3 },  // Camello
  "23": { row: 4, col: 4 },  // Cebra
  "24": { row: 5, col: 0 },  // Iguana
  "25": { row: 5, col: 1 },  // Gallina
  "26": { row: 5, col: 2 },  // Vaca
  "27": { row: 5, col: 3 },  // Perro
  "28": { row: 5, col: 4 },  // Zamuro
  "29": { row: 6, col: 0 },  // Elefante
  "30": { row: 6, col: 1 },  // Caimán
  "31": { row: 6, col: 2 },  // Lapa
  "32": { row: 6, col: 3 },  // Ardilla
  "33": { row: 6, col: 4 },  // Pescado
  "34": { row: 7, col: 0 },  // Venado
  "35": { row: 7, col: 1 },  // Jirafa
  "36": { row: 7, col: 2 },  // Culebra
};

// Full list of all codes for iteration
export const ALL_ANIMAL_CODES = ANIMALS_DATA.map(a => a.code);

// Heat status types
export type HeatStatus = 'hot' | 'warm' | 'cold' | 'overdue';

export const getHeatStatusColor = (status: HeatStatus): string => {
  switch (status) {
    case 'hot': return 'hsl(0, 84%, 60%)'; // Red
    case 'warm': return 'hsl(30, 92%, 50%)'; // Orange
    case 'cold': return 'hsl(210, 100%, 50%)'; // Blue
    case 'overdue': return 'hsl(220, 10%, 60%)'; // Gray
    default: return 'hsl(220, 10%, 60%)';
  }
};

// Generate formatted string for display: "XX - Name"
export const formatAnimalDisplay = (code: string, lotteryId?: string): string => {
  const name = getAnimalName(code, lotteryId);
  const displayCode = code === '0' ? '0' : code === '00' ? '00' : code.padStart(2, '0');
  return `${displayCode} - ${name}`;
};

// Get complete animal list as formatted string for injection into prompts
export const getFullAnimalListString = (lotteryId: string): string => {
  const mapping = getAnimalMappingForLottery(lotteryId);
  return Object.entries(mapping)
    .sort((a, b) => {
      if (a[0] === '00') return 1;
      if (b[0] === '00') return -1;
      return parseInt(a[0]) - parseInt(b[0]);
    })
    .map(([code, name]) => `${code}:${name}`)
    .join(', ');
};
