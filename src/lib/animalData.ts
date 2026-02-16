// ============================================================
// ANIMAL DATA - V75.0 (VERSIÓN FINAL BLINDADA)
// Corregido: Sin duplicados, iconos diferenciados y 00-99 completo.
// ============================================================

export interface AnimalInfo {
  id: number;
  code: string;  
  name: string;
  category: string;
}

export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS', '4': 'ALACRÁN', '5': 'LEÓN',
  '6': 'RANA', '7': 'PERICO', '8': 'RATÓN', '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO',
  '13': 'MONO', '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO', '19': 'CHIVO',
  '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA', '24': 'IGUANA', '25': 'GALLINA',
  '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO', '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA',
  '32': 'ARDILLA', '33': 'PESCADO', '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA'
};

export const ANIMALS_GUACHARO: Record<string, string> = {
  ...ANIMALS_STANDARD,
  '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN',
  '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN',
  '49': 'PEREZA', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO',
  '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN',
  '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO',
  '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA',
  '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO'
};

export const ANIMALS_GUACHARITO: Record<string, string> = {
  ...ANIMALS_GUACHARO,
  '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO',
  '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY',
  '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE',
  '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO',
  '98': 'COCODRILO', '99': 'GUACHARITO'
};

// ICONOS MEJORADOS - Máxima Diferenciación
export const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁",
  "6": "🐸", "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴",
  "13": "🐒", "14": "🕊️", "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐",
  "20": "🐷", "21": "🐓", "22": "🐪", "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄",
  "27": "🐕", "28": "🌑", "29": "🐘", "30": "🐊", "31": "🐹", "32": "🐿️", "33": "🐟",
  "34": "🦌", "35": "🦒", "36": "🐍", "37": "🐢", "38": "🐃", "39": "🦉", "40": "🐝",
  "41": "🦘", "42": "🐦", "43": "🦋", "44": "🐹", "45": "🦩", "46": "🐆", "47": "🦚",
  "48": "🦔", "49": "🦥", "50": "🐤", "51": "🐧", "52": "🐙", "53": "🐌", "54": "🦗",
  "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐈‍⬛", "60": "🦎", "61": "🐼",
  "62": "🐢", "63": "🦀", "64": "🪁", "65": "🕷️", "66": "🐺", "67": "🦢", "68": "🐆",
  "69": "🐇", "70": "🦬", "71": "🌈", "72": "🦍", "73": "🦛", "74": "💛", "75": "🦇",
  "76": "🦏", "77": "❄️", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳",
  "83": "🦉", "84": "🦐", "85": "🐹", "86": "🐂", "87": "🐐", "88": "🫧", "89": "🐍",
  "90": "🦦", "91": "🐢", "92": "🦢", "93": "🌊", "94": "🪶", "95": "🐞", "96": "🦄",
  "97": "🌿", "98": "🐊", "99": "🐣"
};

export const getAnimalMappingForLottery = (lotteryId: string): Record<string, string> => {
  if (lotteryId === 'guacharito') return ANIMALS_GUACHARITO;
  if (lotteryId === 'guacharo') return ANIMALS_GUACHARO;
  return ANIMALS_STANDARD;
};

export const ANIMALS_DATA: AnimalInfo[] = Object.entries(ANIMALS_GUACHARITO).map(([code, name]) => ({
  id: code === '00' ? 100 : parseInt(code) || 0,
  code,
  name,
  category: 'animal',
}));

export const getAnimalByCode = (code: string, lotteryId?: string): AnimalInfo | undefined => {
  const normalizedCode = code?.toString().trim();
  if (!normalizedCode) return undefined;
  const mapping = getAnimalMappingForLottery(lotteryId || 'lotto_activo');
  const name = mapping[normalizedCode] || mapping[parseInt(normalizedCode).toString()];
  if (!name) return undefined;
  return {
    id: normalizedCode === '00' ? 100 : parseInt(normalizedCode) || 0,
    code: normalizedCode,
    name,
    category: 'animal',
  };
};

export const getAnimalName = (code: string, lotteryId?: string): string => {
  return getAnimalByCode(code, lotteryId)?.name || `Número ${code}`;
};

export const getAnimalEmoji = (code: string): string => {
  const normalizedCode = code?.toString().trim();
  if (normalizedCode === "0" || normalizedCode === "00") return ANIMAL_EMOJIS[normalizedCode];
  return ANIMAL_EMOJIS[parseInt(normalizedCode).toString()] || "🔢";
};

export const formatAnimalDisplay = (code: string, lotteryId?: string): string => {
  const name = getAnimalName(code, lotteryId);
  const displayCode = code === '0' ? '0' : code === '00' ? '00' : code.padStart(2, '0');
  return `${displayCode} - ${name}`;
};
  const normalizedCode = code?.toString().trim();
  if (normalizedCode === "0" || normalizedCode === "00") return ANIMAL_EMOJIS[normalizedCode];
  return ANIMAL_EMOJIS[parseInt(normalizedCode).toString()] || "🔢";
};
