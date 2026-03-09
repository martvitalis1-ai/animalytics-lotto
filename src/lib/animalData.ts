export interface AnimalInfo {
  id: number;
  code: string;  
  name: string;
  category: string;
}

export const ANIMALS_MAESTRO_MAP: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN', 
  '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', 
  '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO', 
  '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA', 
  '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', 
  '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA',
  '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN',
  '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN',
  '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO',
  '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN',
  '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO',
  '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA',
  '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO', '76': 'RINOCERONTE', '77': 'PINGÜINO',
  '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO',
  '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA',
  '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO',
  '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO'
};

export const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", "7": "🦜", "8": "🐭",
  "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃",
  "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄",
  "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒",
  "36": "🐍", "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫",
  "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", "53": "🐌",
  "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", "61": "🐼", "62": "🦔",
  "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", "69": "🐰", "70": "🦬", "71": "🦜",
  "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇",
  "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", "85": "🐹", "86": "Buey", "87": "Cabra", "88": "Erizo", "89": "Anguila",
  "90": "Hurón", "91": "Tortuga", "92": "Cisne", "93": "Gaviota", "94": "Paují", "95": "Escarabajo", "96": "Caballito", "97": "Loro", "98": "Cocodrilo", "99": "Guacharito"
};

export const SPRITE_POSITIONS: Record<string, { row: number; col: number }> = {
  "0": { row: 0, col: 0 }, "00": { row: 0, col: 1 }, "1": { row: 0, col: 2 }, "2": { row: 0, col: 3 }, "3": { row: 0, col: 4 },
  "4": { row: 1, col: 0 }, "5": { row: 1, col: 1 }, "6": { row: 1, col: 2 }, "7": { row: 1, col: 3 }, "8": { row: 1, col: 4 },
  "9": { row: 2, col: 0 }, "10": { row: 2, col: 1 }, "11": { row: 2, col: 2 }, "12": { row: 2, col: 3 }, "13": { row: 2, col: 4 },
  "14": { row: 3, col: 0 }, "15": { row: 3, col: 1 }, "16": { row: 3, col: 2 }, "17": { row: 3, col: 3 }, "18": { row: 3, col: 4 },
  "19": { row: 4, col: 0 }, "20": { row: 4, col: 1 }, "21": { row: 4, col: 2 }, "22": { row: 4, col: 3 }, "23": { row: 4, col: 4 },
  "24": { row: 5, col: 0 }, "25": { row: 5, col: 1 }, "26": { row: 5, col: 2 }, "27": { row: 5, col: 3 }, "28": { row: 5, col: 4 },
  "29": { row: 6, col: 0 }, "30": { row: 6, col: 1 }, "31": { row: 6, col: 2 }, "32": { row: 6, col: 3 }, "33": { row: 6, col: 4 },
  "34": { row: 7, col: 0 }, "35": { row: 7, col: 1 }, "36": { row: 7, col: 2 },
};

export const getAnimalByCode = (code: string): AnimalInfo | undefined => {
  if (!code) return undefined;
  const norm = code.toString().trim();
  const name = ANIMALS_MAESTRO_MAP[norm] || ANIMALS_MAESTRO_MAP[parseInt(norm).toString()];
  return name ? { id: parseInt(norm) || 0, code: norm, name, category: "general" } : undefined;
};

export const getAnimalEmoji = (code: string): string => {
  const norm = code?.toString().trim() || "";
  const clean = (norm === "00" || norm === "0") ? norm : parseInt(norm).toString();
  return ANIMAL_EMOJIS[clean] || "🔢";
};

export const getAnimalName = (code: string): string => getAnimalByCode(code)?.name || "ANIMAL";

export const getCodesForLottery = (id: string): string[] => {
  const lotto = id.toLowerCase();
  const max = lotto.includes('guacharito') ? 99 : lotto.includes('guacharo') ? 75 : 36;
  return ['0', '00', ...Array.from({ length: max }, (_, i) => (i + 1).toString())];
};

export type HeatStatus = 'hot' | 'warm' | 'cold' | 'overdue';
export const getHeatStatusColor = (s: HeatStatus) => {
  if (s === 'hot') return 'hsl(0, 84%, 60%)';
  if (s === 'warm') return 'hsl(30, 92%, 50%)';
  return 'hsl(210, 100%, 50%)';
};
