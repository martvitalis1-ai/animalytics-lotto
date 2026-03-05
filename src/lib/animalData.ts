export interface AnimalInfo {
  id: number;
  code: string;  
  name: string;
  category: string;
}

export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '1': 'CARNERO', '2': 'TORO', '3': 'CIEMPIÉS',
  '4': 'ALACRÁN', '5': 'LEÓN', '6': 'RANA', '7': 'PERICO', '8': 'RATÓN',
  '9': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO',
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO',
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA',
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO',
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO',
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA',
};

export const ANIMAL_EMOJIS: Record<string, string> = {
  "0": "🐬", "00": "🐋", "1": "🐏", "2": "🐂", "3": "🐛", "4": "🦂", "5": "🦁", "6": "🐸", 
  "7": "🦜", "8": "🐭", "9": "🦅", "10": "🐯", "11": "🐱", "12": "🐴", "13": "🐵", "14": "🕊️", 
  "15": "🦊", "16": "🐻", "17": "🦃", "18": "🫏", "19": "🐐", "20": "🐷", "21": "🐓", "22": "🐪", 
  "23": "🦓", "24": "🦎", "25": "🐔", "26": "🐄", "27": "🐕", "28": "🦅", "29": "🐘", "30": "🐊", 
  "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍"
};

export const getAnimalByCode = (code: string): AnimalInfo | undefined => {
  if (!code) return undefined;
  const normalized = code.toString().trim();
  if (normalized === "00") return { id: 100, code: "00", name: "BALLENA", category: "acuatico" };
  const searchCode = normalized === "0" ? "0" : parseInt(normalized, 10).toString();
  const name = ANIMALS_STANDARD[searchCode] || "ANIMAL";
  return { id: parseInt(searchCode, 10) || 0, code: normalized, name: name, category: "general" };
};

export const getAnimalEmoji = (code: string): string => {
  if (!code) return "❓";
  const normalized = code.toString().trim();
  if (normalized === "00") return "🐋";
  const searchCode = normalized === "0" ? "0" : parseInt(normalized, 10).toString();
  return ANIMAL_EMOJIS[searchCode] || "🔢";
};

export const getAnimalName = (code: string): string => {
  const a = getAnimalByCode(code);
  return a ? a.name : "ANIMAL";
};

export const getCodesForLottery = (lotteryId: string): string[] => {
  return ['0', '00', ...Array.from({ length: 36 }, (_, i) => (i + 1).toString())];
};
