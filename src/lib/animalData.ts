// ============================================================
// ANIMAL DATA - Full 0-99 Database for all lotteries
// ============================================================

export interface AnimalInfo {
  id: number;
  code: string;  // String to properly handle "0" vs "00"
  name: string;
  category: string;
}

// Master array with full 0-99 support + "00" Ballena distinction
export const ANIMALS_DATA: AnimalInfo[] = [
  // --- GRUPO 1: CLÁSICOS (0-36) ---
  { id: 0, code: "0", name: "DELFÍN", category: "acuatico" },
  { id: 100, code: "00", name: "BALLENA", category: "acuatico" }, // ID 100 to avoid conflict
  { id: 1, code: "1", name: "CARNERO", category: "granja" },
  { id: 2, code: "2", name: "TORO", category: "granja" },
  { id: 3, code: "3", name: "CIEMPIÉS", category: "insecto" },
  { id: 4, code: "4", name: "ALACRÁN", category: "insecto" },
  { id: 5, code: "5", name: "LEÓN", category: "selva" },
  { id: 6, code: "6", name: "RANA", category: "acuatico" },
  { id: 7, code: "7", name: "PERICO", category: "ave" },
  { id: 8, code: "8", name: "RATÓN", category: "plaga" },
  { id: 9, code: "9", name: "ÁGUILA", category: "ave" },
  { id: 10, code: "10", name: "TIGRE", category: "selva" },
  { id: 11, code: "11", name: "GATO", category: "domestico" },
  { id: 12, code: "12", name: "CABALLO", category: "granja" },
  { id: 13, code: "13", name: "MONO", category: "selva" },
  { id: 14, code: "14", name: "PALOMA", category: "ave" },
  { id: 15, code: "15", name: "ZORRO", category: "selva" },
  { id: 16, code: "16", name: "OSO", category: "selva" },
  { id: 17, code: "17", name: "PAVO", category: "ave" },
  { id: 18, code: "18", name: "BURRO", category: "granja" },
  { id: 19, code: "19", name: "CHIVO", category: "granja" },
  { id: 20, code: "20", name: "CERDO", category: "granja" },
  { id: 21, code: "21", name: "GALLO", category: "ave" },
  { id: 22, code: "22", name: "CAMELLO", category: "desierto" },
  { id: 23, code: "23", name: "CEBRA", category: "selva" },
  { id: 24, code: "24", name: "IGUANA", category: "reptil" },
  { id: 25, code: "25", name: "GALLINA", category: "ave" },
  { id: 26, code: "26", name: "VACA", category: "granja" },
  { id: 27, code: "27", name: "PERRO", category: "domestico" },
  { id: 28, code: "28", name: "ZAMURO", category: "ave" },
  { id: 29, code: "29", name: "ELEFANTE", category: "selva" },
  { id: 30, code: "30", name: "CAIMÁN", category: "reptil" },
  { id: 31, code: "31", name: "LAPA", category: "silvestre" },
  { id: 32, code: "32", name: "ARDILLA", category: "silvestre" },
  { id: 33, code: "33", name: "PESCADO", category: "acuatico" },
  { id: 34, code: "34", name: "VENADO", category: "silvestre" },
  { id: 35, code: "35", name: "JIRAFA", category: "selva" },
  { id: 36, code: "36", name: "CULEBRA", category: "reptil" },

  // --- GRUPO 2: EXTENDIDOS (37-75) ---
  { id: 37, code: "37", name: "TORTUGA", category: "reptil" },
  { id: 38, code: "38", name: "BÚFALO", category: "selva" },
  { id: 39, code: "39", name: "LECHUZA", category: "ave" },
  { id: 40, code: "40", name: "AVISPA", category: "insecto" },
  { id: 41, code: "41", name: "CANGURO", category: "exotico" },
  { id: 42, code: "42", name: "TUCÁN", category: "ave" },
  { id: 43, code: "43", name: "MARIPOSA", category: "insecto" },
  { id: 44, code: "44", name: "CHIGÜIRE", category: "silvestre" },
  { id: 45, code: "45", name: "GARZA", category: "ave" },
  { id: 46, code: "46", name: "PUMA", category: "selva" },
  { id: 47, code: "47", name: "PAVO REAL", category: "ave" },
  { id: 48, code: "48", name: "PUERCOESPÍN", category: "silvestre" },
  { id: 49, code: "49", name: "PEREZA", category: "selva" },
  { id: 50, code: "50", name: "CANARIO", category: "ave" },
  { id: 51, code: "51", name: "PELÍCANO", category: "ave" },
  { id: 52, code: "52", name: "PULPO", category: "acuatico" },
  { id: 53, code: "53", name: "CARACOL", category: "molusco" },
  { id: 54, code: "54", name: "GRILLO", category: "insecto" },
  { id: 55, code: "55", name: "OSO HORMIGUERO", category: "silvestre" },
  { id: 56, code: "56", name: "TIBURÓN", category: "acuatico" },
  { id: 57, code: "57", name: "PATO", category: "ave" },
  { id: 58, code: "58", name: "HORMIGA", category: "insecto" },
  { id: 59, code: "59", name: "PANTERA", category: "selva" },
  { id: 60, code: "60", name: "CAMALEÓN", category: "reptil" },
  { id: 61, code: "61", name: "PANDA", category: "exotico" },
  { id: 62, code: "62", name: "CACHICAMO", category: "silvestre" },
  { id: 63, code: "63", name: "CANGREJO", category: "acuatico" },
  { id: 64, code: "64", name: "GAVILÁN", category: "ave" },
  { id: 65, code: "65", name: "ARAÑA", category: "insecto" },
  { id: 66, code: "66", name: "LOBO", category: "selva" },
  { id: 67, code: "67", name: "AVESTRUZ", category: "ave" },
  { id: 68, code: "68", name: "JAGUAR", category: "selva" },
  { id: 69, code: "69", name: "CONEJO", category: "domestico" },
  { id: 70, code: "70", name: "BISONTE", category: "selva" },
  { id: 71, code: "71", name: "GUACAMAYA", category: "ave" },
  { id: 72, code: "72", name: "GORILA", category: "selva" },
  { id: 73, code: "73", name: "HIPOPÓTAMO", category: "selva" },
  { id: 74, code: "74", name: "TURPIAL", category: "ave" },
  { id: 75, code: "75", name: "GUÁCHARO", category: "ave" },

  // --- GRUPO 3: NUEVOS (76-99) ---
  { id: 76, code: "76", name: "RINOCERONTE", category: "selva" },
  { id: 77, code: "77", name: "PINGÜINO", category: "acuatico" },
  { id: 78, code: "78", name: "ANTÍLOPE", category: "selva" },
  { id: 79, code: "79", name: "CALAMAR", category: "acuatico" },
  { id: 80, code: "80", name: "MURCIÉLAGO", category: "silvestre" },
  { id: 81, code: "81", name: "CUERVO", category: "ave" },
  { id: 82, code: "82", name: "CUCARACHA", category: "insecto" },
  { id: 83, code: "83", name: "BÚHO", category: "ave" },
  { id: 84, code: "84", name: "CAMARÓN", category: "acuatico" },
  { id: 85, code: "85", name: "HÁMSTER", category: "domestico" },
  { id: 86, code: "86", name: "BUEY", category: "granja" },
  { id: 87, code: "87", name: "CABRA", category: "granja" },
  { id: 88, code: "88", name: "ERIZO DE MAR", category: "acuatico" },
  { id: 89, code: "89", name: "ANGUILA", category: "acuatico" },
  { id: 90, code: "90", name: "HURÓN", category: "domestico" },
  { id: 91, code: "91", name: "MORROCOY", category: "reptil" },
  { id: 92, code: "92", name: "CISNE", category: "ave" },
  { id: 93, code: "93", name: "GAVIOTA", category: "ave" },
  { id: 94, code: "94", name: "PAUJIL", category: "ave" },
  { id: 95, code: "95", name: "ESCARABAJO", category: "insecto" },
  { id: 96, code: "96", name: "CABALLITO DE MAR", category: "acuatico" },
  { id: 97, code: "97", name: "LORO", category: "ave" },
  { id: 98, code: "98", name: "COCODRILO", category: "reptil" },
  { id: 99, code: "99", name: "GUACHARITO", category: "ave" },
];

// Create lookup map for fast access by code (string)
const ANIMAL_BY_CODE = new Map<string, AnimalInfo>();
ANIMALS_DATA.forEach(animal => {
  ANIMAL_BY_CODE.set(animal.code, animal);
});

// Get animal by code (string comparison for 0/00 distinction)
export const getAnimalByCode = (code: string): AnimalInfo | undefined => {
  const normalizedCode = code?.toString().trim();
  if (!normalizedCode) return undefined;
  
  // Exact match first for "0" and "00"
  if (normalizedCode === "0" || normalizedCode === "00") {
    return ANIMAL_BY_CODE.get(normalizedCode);
  }
  
  // For other numbers, normalize (remove leading zeros except for "00")
  const numericCode = parseInt(normalizedCode).toString();
  return ANIMAL_BY_CODE.get(numericCode);
};

// Get animal name from code
export const getAnimalName = (code: string): string => {
  const animal = getAnimalByCode(code);
  return animal?.name || `Número ${code}`;
};

// Get codes for specific lottery ranges
export const getCodesForLottery = (lotteryId: string): string[] => {
  if (lotteryId === 'guacharo') {
    // Guácharo Activo: 0-75 + "00"
    return ['0', '00', ...Array.from({ length: 75 }, (_, i) => (i + 1).toString())];
  }
  if (lotteryId === 'guacharito') {
    // Guacharito: 0-99 + "00"
    return ['0', '00', ...Array.from({ length: 99 }, (_, i) => (i + 1).toString())];
  }
  // Standard animal lotteries: 0-36 + "00"
  return ['0', '00', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];
};

// Emoji mapping for visual representation
// ZAMURO (28) uses 🪶 (black feather) to differentiate from ÁGUILA (9)
export const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛",
  "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭",
  "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵",
  "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏",
  "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓",
  "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", // ZAMURO - Uses custom image via ZAMURO_IMAGE
  "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟",
  "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🦬",
  "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋",
  "44": "🦫", "45": "🦢", "46": "🐆", "47": "🦚", "48": "🦔",
  "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌",
  "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜",
  "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔", "63": "🦀",
  "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆",
  "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛",
  "74": "🐦", "75": "🦅", "76": "🦏", "77": "🐧", "78": "🦌",
  "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉",
  "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🦔",
  "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", "93": "🐦",
  "94": "🦃", "95": "🪲", "96": "🐠", "97": "🦜", "98": "🐊",
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
  "20": { row: 4, col: 1 },  // Cerdo
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
