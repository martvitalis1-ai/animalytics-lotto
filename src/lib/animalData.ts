// ============================================================
// ANIMAL DATA - Master data with full support for 0/00 distinction
// ============================================================

export interface AnimalInfo {
  id: number;
  code: string;  // String to properly handle "0" vs "00"
  name: string;
  category: string;
}

// Master array with proper 0/00 handling - "00" is Ballena (id: 37), "0" is Delfín
export const ANIMALS_DATA: AnimalInfo[] = [
  { id: 0, code: "0", name: "DELFÍN", category: "acuatico" },
  { id: 37, code: "00", name: "BALLENA", category: "acuatico" },
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
  { id: 20, code: "20", name: "COCHINO", category: "granja" },
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
  { id: 36, code: "36", name: "CULEBRA", category: "reptil" }
];

// Get animal by code (string comparison for 0/00 distinction)
export const getAnimalByCode = (code: string): AnimalInfo | undefined => {
  const normalizedCode = code.trim();
  // Exact match first for "0" and "00"
  if (normalizedCode === "0" || normalizedCode === "00") {
    return ANIMALS_DATA.find(a => a.code === normalizedCode);
  }
  // For other numbers, normalize
  const numericCode = parseInt(normalizedCode).toString();
  return ANIMALS_DATA.find(a => a.code === numericCode);
};

// Get animal name from number
export const getAnimalName = (code: string): string => {
  const animal = getAnimalByCode(code);
  return animal?.name || '';
};

// Sprite coordinates mapping (row, column in the sprite sheet)
// Based on the uploaded sprite sheet layout
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
  "31": { row: 6, col: 2 },  // Lapa (missing - use placeholder)
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
