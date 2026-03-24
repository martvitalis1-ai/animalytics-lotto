export const SUPA_STORAGE_URL = "https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/";

export const ANIMALS_STANDARD: Record<string, string> = {
  '0': 'DELFÍN', '00': 'BALLENA', '01': 'CARNERO', '02': 'TORO', '03': 'CIEMPIÉS',
  '04': 'ALACRÁN', '05': 'LEÓN', '06': 'RANA', '07': 'PERICO', '08': 'RATÓN',
  '09': 'ÁGUILA', '10': 'TIGRE', '11': 'GATO', '12': 'CABALLO', '13': 'MONO',
  '14': 'PALOMA', '15': 'ZORRO', '16': 'OSO', '17': 'PAVO', '18': 'BURRO',
  '19': 'CHIVO', '20': 'COCHINO', '21': 'GALLO', '22': 'CAMELLO', '23': 'CEBRA',
  '24': 'IGUANA', '25': 'GALLINA', '26': 'VACA', '27': 'PERRO', '28': 'ZAMURO',
  '29': 'ELEFANTE', '30': 'CAIMÁN', '31': 'LAPA', '32': 'ARDILLA', '33': 'PESCADO',
  '34': 'VENADO', '35': 'JIRAFA', '36': 'CULEBRA'
};

export const ANIMALS_GUACHARO: Record<string, string> = {
  ...ANIMALS_STANDARD,
  '37': 'TORTUGA', '38': 'BÚFALO', '39': 'LECHUZA', '40': 'AVISPA', '41': 'CANGURO',
  '42': 'TUCÁN', '43': 'MARIPOSA', '44': 'CHIGÜIRE', '45': 'GARZA', '46': 'PUMA',
  '47': 'PAVO REAL', '48': 'PUERCOESPÍN', '49': 'PEREZOSO', '50': 'CANARIO',
  '51': 'PELÍCANO', '52': 'PULPO', '53': 'CARACOL', '54': 'GRILLO', '55': 'OSO HORMIGUERO',
  '56': 'TIBURÓN', '57': 'PATO', '58': 'HORMIGA', '59': 'PANTERA', '60': 'CAMALEÓN',
  '61': 'PANDA', '62': 'CACHICAMO', '63': 'CANGREJO', '64': 'GAVILÁN', '65': 'ARAÑA',
  '66': 'LOBO', '67': 'AVESTRUZ', '68': 'JAGUAR', '69': 'CONEJO', '70': 'BISONTE',
  '71': 'GUACAMAYA', '72': 'GORILA', '73': 'HIPOPÓTAMO', '74': 'TURPIAL', '75': 'GUÁCHARO'
};

export const ANIMALS_GUACHARITO: Record<string, string> = {
  ...ANIMALS_GUACHARO,
  '76': 'RINOCERONTE', '77': 'PINGÜINO', '78': 'ANTÍLOPE', '79': 'CALAMAR', '80': 'MURCIÉLAGO',
  '81': 'CUERVO', '82': 'CUCARACHA', '83': 'BÚHO', '84': 'CAMARÓN', '85': 'HÁMSTER',
  '86': 'BUEY', '87': 'CABRA', '88': 'ERIZO DE MAR', '89': 'ANGUILA', '90': 'HURÓN',
  '91': 'MORROCOY', '92': 'CISNE', '93': 'GAVIOTA', '94': 'PAUJÍ', '95': 'ESCARABAJO',
  '96': 'CABALLITO DE MAR', '97': 'LORO', '98': 'COCODRILO', '99': 'GUACHARITO'
};

export const getAnimalName = (code: string | number, lotteryId?: string): string => {
  const mapping = lotteryId === 'guacharito' ? ANIMALS_GUACHARITO : 
                  (lotteryId === 'guacharo' || lotteryId === 'guacharo') ? ANIMALS_GUACHARO : ANIMALS_STANDARD;
  const c = String(code).trim().padStart(2, '0');
  return mapping[c] || "ANIMAL";
};

export const getAnimalEmoji = (code: string | number): string => "🎯";

export const getCodesForLottery = (id: string): string[] => {
  let max = 36;
  if (id === 'guacharo' || id === 'el_guacharo') max = 75;
  if (id === 'guacharito') max = 99;
  const codes = ['0', '00'];
  for (let i = 1; i <= max; i++) codes.push(i.toString().padStart(2, '0'));
  return codes;
};

export const getAnimalImageUrl = (code: string | number): string => {
  const str = String(code).trim();
  const normalized = (str === '0' || str === '00') ? str : str.padStart(2, '0');
  return `${SUPA_STORAGE_URL}${normalized}.png`;
};
