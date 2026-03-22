// src/lib/animalData.ts
export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

// Standard 0-36 lottery animals
export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '01': 'CARNERO', '02': 'TORO', '03': 'CIEMPIÉS',
  '04': 'ALACRÁN', '05': 'LEÓN', '06': 'RANA', '07': 'PERICO', '08': 'RATÓN',
  '09': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO',
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO',
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA',
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO',
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO',
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA',
};

// Guácharo Activo 0-75
export const ANIMALS_GUACHARO: Record<string, string> = {
  ...ANIMALS_STANDARD,
  '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA',
  '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE',
  '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN',
  '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO',
  '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN',
  '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN',
  '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN',
  '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR',
  '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA',
  '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO',
};

// Guacharito 0-99
export const ANIMALS_GUACHARITO: Record<string, string> = {
  ...ANIMALS_GUACHARO,
  '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR',
  '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO',
  '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA',
  '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY',
  '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO',
  '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO',
};

/** Normalize an animal code to its canonical string form. NEVER uses parseInt for "0"/"00". */
const normalizeCode = (code: string | number): string => {
  const str = String(code).trim();
  if (str === '0' || str === '00') return str;
  if (!str) return '00';
  return str.padStart(2, '0');
};

export const getAnimalName = (code: string | number): string => {
  const normalized = normalizeCode(code);
  return ANIMALS_GUACHARITO[normalized] || "ANIMAL";
};

export const getAnimalImageUrl = (code: string | number): string => {
  const normalized = normalizeCode(code);
  return `${SUPA_STORAGE_URL}${normalized}.png`;
};

export const getAnimalByCode = (code: string | number) => {
  const name = getAnimalName(code);
  return { id: 0, code: String(code), name, category: "general" };
};

/** Returns the list of valid codes for a given lottery */
export const getCodesForLottery = (lotteryId: string): string[] => {
  const ranges: Record<string, number> = {
    'guacharo': 75,
    'guacharito': 99,
    'lotto_activo': 36,
    'granjita': 36,
    'selva_plus': 36,
    'lotto_rey': 36,
  };
  const max = ranges[lotteryId] ?? 36;
  const codes: string[] = ['0', '00'];
  for (let i = 1; i <= max; i++) {
    codes.push(i.toString().padStart(2, '0'));
  }
  return codes;
};

/** Simple emoji fallback for animals */
export const getAnimalEmoji = (code: string | number): string => {
  const emojis: Record<string, string> = {
    '0': '🐬', '00': '🐋', '01': '🐏', '02': '🐂', '03': '🐛', '04': '🦂', '05': '🦁',
    '06': '🐸', '07': '🦜', '08': '🐭', '09': '🦅', '10': '🐯', '11': '🐱', '12': '🐴',
    '13': '🐒', '14': '🕊️', '15': '🦊', '16': '🐻', '17': '🦃', '18': '🫏', '19': '🐐',
    '20': '🐷', '21': '🐓', '22': '🐪', '23': '🦓', '24': '🦎', '25': '🐔', '26': '🐄',
    '27': '🐕', '28': '🦅', '29': '🐘', '30': '🐊', '31': '🐹', '32': '🐿️', '33': '🐟',
    '34': '🦌', '35': '🦒', '36': '🐍', '37': '🐢', '38': '🦬', '39': '🦉', '40': '🐝',
    '41': '🦘', '42': '🦜', '43': '🦋', '44': '🦫', '45': '🦩', '46': '🐆', '47': '🦚',
    '48': '🦔', '49': '🦥', '50': '🐤', '51': '🦢', '52': '🐙', '53': '🐌', '54': '🦗',
    '55': '🐻', '56': '🦈', '57': '🦆', '58': '🐜', '59': '🐈‍⬛', '60': '🦎', '61': '🐼',
    '62': '🦔', '63': '🦀', '64': '🦅', '65': '🕷️', '66': '🐺', '67': '🦩', '68': '🐆',
    '69': '🐇', '70': '🦬', '71': '🦜', '72': '🦍', '73': '🦛', '74': '🐦', '75': '🦇',
    '76': '🦏', '77': '🐧', '78': '🦌', '79': '🦑', '80': '🦇', '81': '🐦‍⬛', '82': '🪳',
    '83': '🦉', '84': '🦐', '85': '🐹', '86': '🐂', '87': '🐐', '88': '🦔', '89': '🐍',
    '90': '🦦', '91': '🐢', '92': '🦢', '93': '🕊️', '94': '🦃', '95': '🪲', '96': '🐴',
    '97': '🦜', '98': '🐊', '99': '🐦',
  };
  const normalized = normalizeCode(code);
  return emojis[normalized] || '🐾';
};

/** Max number for lottery */
export const getMaxNumberForLottery = (lotteryId: string): number => {
  const ranges: Record<string, number> = {
    'guacharo': 75, 'guacharito': 99, 'lotto_activo': 36,
    'granjita': 36, 'selva_plus': 36, 'lotto_rey': 36,
  };
  return ranges[lotteryId] ?? 36;
};

/** Sprite positions placeholder for compatibility */
export const SPRITE_POSITIONS: Record<string, { x: number; y: number }> = {};
