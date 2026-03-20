// src/lib/animalData.ts
export const SUPA_IMG_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

const ALL_NAMES: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '01': 'CARNERO', '02': 'TORO', '03': 'CIEMPIÉS',
  '04': 'ALACRÁN', '05': 'LEÓN', '06': 'RANA', '07': 'PERICO', '08': 'RATÓN',
  '09': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO',
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO',
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA',
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO',
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO',
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA', '37': 'TORTUGA', '38': 'BÚFALO',
  '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO', '42': 'TUCÁN', '43': 'MARIPOSA',
  '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA', '47': 'PAVO REAL', '48': 'PUERCOESPÍN',
  '49': 'PEREZOSO', '50': 'CANARIO', '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL',
  '54': 'GRILLO', '55': 'OSO HORMIGUERO', '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA',
  '59': 'PANTERA', '60': 'CAMALEÓN', '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO',
  '64': 'GAVILÁN', '65': 'ARAÑA', '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR',
  '69': 'CONEJO', '70': 'BISONTE', '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO',
  '74': 'TURPIAL', '75': 'GUÁCHARO', '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE',
  '79': 'CALAMAR', '80': 'MURCIÉLAGO', '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO',
  '84': 'CAMARÓN', '85': 'HÁMSTER', '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR',
  '89': 'ANGUILA', '90': 'HURÓN', '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA',
  '94': 'PAUJÍ', '95': 'ESCARABAJO', '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO',
  '99': 'GUACHARITO'
};

// Build dictionary subsets
const buildDict = (max: number): Record<string, string> => {
  const d: Record<string, string> = { '0': ALL_NAMES['0'], '00': ALL_NAMES['00'] };
  for (let i = 1; i <= max; i++) d[i.toString().padStart(2, '0')] = ALL_NAMES[i.toString().padStart(2, '0')] || 'ANIMAL';
  return d;
};

export const ANIMALS_STANDARD: Record<string, string> = buildDict(36);
export const ANIMALS_GUACHARO: Record<string, string> = buildDict(75);
export const ANIMALS_GUACHARITO: Record<string, string> = buildDict(99);

export const SPRITE_POSITIONS: Record<string, { x: number; y: number; col: number; row: number }> = {};

const EMOJI_MAP: Record<string, string> = {
  '0': '🐬', '00': '🐋', '1': '🐏', '01': '🐏', '2': '🐂', '02': '🐂', '3': '🐛', '03': '🐛',
  '4': '🦂', '04': '🦂', '5': '🦁', '05': '🦁', '6': '🐸', '06': '🐸', '7': '🦜', '07': '🦜',
  '8': '🐭', '08': '🐭', '9': '🦅', '09': '🦅', '10': '🐯', '11': '🐱', '12': '🐴', '13': '🐵',
  '14': '🕊️', '15': '🦊', '16': '🐻', '17': '🦃', '18': '🫏', '19': '🐐', '20': '🐷',
  '21': '🐓', '22': '🐪', '23': '🦓', '24': '🦎', '25': '🐔', '26': '🐄', '27': '🐕',
  '28': '🦅', '29': '🐘', '30': '🐊', '31': '🦫', '32': '🐿️', '33': '🐟', '34': '🦌',
  '35': '🦒', '36': '🐍'
};

export const getAnimalEmoji = (code: string | number): string => {
  const str = String(code).trim();
  const n = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return EMOJI_MAP[n] || EMOJI_MAP[str] || '🎯';
};

export const getAnimalName = (code: string | number, _lotteryId?: string): string => {
  const str = String(code).trim();
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return ALL_NAMES[normalized] || "ANIMAL";
};

export const getAnimalImageUrl = (code: string | number): string => {
  const str = String(code).trim();
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return `${SUPA_IMG_URL}${normalized}.png`;
};

export const getMaxNumberForLottery = (lotteryId: string): number => {
  const ranges: Record<string, number> = {
    guacharo: 75, guacharito: 99,
    lotto_activo: 36, granjita: 36, selva_plus: 36,
    lotto_rey: 36, chance_animalitos: 36, triple_zamorano: 36,
  };
  return ranges[lotteryId] || 36;
};

export const getCodesForLottery = (lotteryId: string): string[] => {
  const max = getMaxNumberForLottery(lotteryId);
  const codes = ['0', '00'];
  for (let i = 1; i <= max; i++) codes.push(i.toString().padStart(2, '0'));
  return codes;
};

export const getAnimalByCode = (code: string | number) => {
  const name = getAnimalName(code);
  return { id: 0, code: String(code), name, category: "general" };
};
