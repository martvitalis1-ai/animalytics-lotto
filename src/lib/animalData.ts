// Reemplaza TODO el contenido de animalData.ts con este código corregido
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
  "31": "🦫", "32": "🐿️", "33": "🐟", "34": "🦌", "35": "🦒", "36": "🐍",
  // Soporte para Guacharo/Guacharito
  "37": "🐢", "38": "🦬", "39": "🦉", "40": "🐝", "41": "🦘", "42": "🦜", "43": "🦋", "44": "🦫", 
  "45": "🦩", "46": "🐆", "47": "🦚", "48": "🦔", "49": "🦥", "50": "🐤", "51": "🦅", "52": "🐙", 
  "53": "🐌", "54": "🦗", "55": "🐜", "56": "🦈", "57": "🦆", "58": "🐜", "59": "🐆", "60": "🦎", 
  "61": "🐼", "62": "🦔", "63": "🦀", "64": "🦅", "65": "🕷️", "66": "🐺", "67": "🦃", "68": "🐆", 
  "69": "🐰", "70": "🦬", "71": "🦜", "72": "🦍", "73": "🦛", "74": "🐦", "75": "🦅", "76": "🦅", 
  "77": "🐧", "78": "🦌", "79": "🦑", "80": "🦇", "81": "🐦‍⬛", "82": "🪳", "83": "🦉", "84": "🦐", 
  "85": "🐹", "86": "🐂", "87": "🐐", "88": "🐚", "89": "🐍", "90": "🦦", "91": "🐢", "92": "🦢", 
  "93": "🐦", "94": "🦃", "95": "🐞", "96": "🐠", "97": "🦜", "98": "🐊", "99": "🐣"
};

// Función MEJORADA para obtener animal sin errores
export const getAnimalByCode = (code: string): AnimalInfo | undefined => {
  if (!code) return undefined;
  const normalized = code.toString().trim();
  
  // Caso especial Ballena
  if (normalized === "00") return { id: 100, code: "00", name: "BALLENA", category: "acuatico" };
  
  // Para los demás, quitamos el 0 a la izquierda para buscar en el mapeo (ej: "07" -> "7")
  const searchCode = normalized === "0" ? "0" : parseInt(normalized, 10).toString();
  const name = ANIMALS_STANDARD[searchCode] || "ANIMAL";

  return {
    id: parseInt(searchCode, 10) || 0,
    code: normalized,
    name: name,
    category: "general"
  };
};

export const getAnimalEmoji = (code: string): string => {
  if (!code) return "❓";
  const normalized = code.toString().trim();
  if (normalized === "00") return "🐋";
  const searchCode = normalized === "0" ? "0" : parseInt(normalized, 10).toString();
  return ANIMAL_EMOJIS[searchCode] || "🔢";
};

// Exportamos lo que el Dashboard y el Bot necesitan
export const getAnimalName = (code: string): string => {
  const a = getAnimalByCode(code);
  return a ? a.name : "ANIMAL";
};
