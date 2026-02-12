/**
 * ============================================================
 * ANIMALYTICS PRO - Google Apps Script Scraper (VERSIÓN CORREGIDA)
 * ============================================================
 */

// ===== CONFIGURACIÓN - ASEGÚRATE DE QUE ESTOS DATOS SEAN CORRECTOS =====
const SUPABASE_URL = 'https://qfdrmyuuswiubsppyjrt.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZHJteXV1c3dpdWJzcHB5anJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDU1NDEsImV4cCI6MjA4NjQ4MTU0MX0.u3afSc4T--SnAniJOcjiUdVodP1p1aFof3FjqtZNlqY'; 

// ===== ANIMAL MAPPING (Asegurando formato de 2 dígitos) =====
const ANIMAL_MAPPING = {
  'delfin': '00', 'delfín': '00', 'ballena': '00',
  'carnero': '01', 'toro': '02', 'ciempiés': '03', 'ciempies': '03', 'alacrán': '04', 'alacran': '04',
  'león': '05', 'leon': '05', 'rana': '06', 'perico': '07', 'ratón': '08', 'raton': '08',
  'águila': '09', 'aguila': '09', 'tigre': '10', 'gato': '11', 'caballo': '12', 'mono': '13',
  'paloma': '14', 'zorro': '15', 'oso': '16', 'pavo': '17', 'burro': '18', 'chivo': '19',
  'cochino': '20', 'gallo': '21', 'camello': '22', 'cebra': '23', 'iguana': '24', 'gallina': '25',
  'vaca': '26', 'perro': '27', 'zamuro': '28', 'elefante': '29', 'caimán': '30', 'caiman': '30',
  'lapa': '31', 'cabra': '32', 'pescado': '33', 'venado': '34', 'jirafa': '35', 'culebra': '36',
  // Guácharo / Otros
  'abeja': '37', 'araña': '38', 'arana': '38', 'ardilla': '39', 'armadillo': '40',
  'babilla': '41', 'ballena azul': '42', 'buho': '43', 'búho': '43', 'caballo de mar': '44',
  'cangrejo': '45', 'chigüire': '46', 'chiguire': '46', 'cocodrilo': '47', 'cotorra': '48',
  'perezoso': '49', 'danta': '50', 'flamenco': '51', 'gaviota': '52', 'gorila': '53',
  'guacamaya': '54', 'hipopótamo': '55', 'hipopotamo': '55', 'hormiga': '56', 'jaguar': '57',
  'langosta': '58', 'lechuza': '59', 'leopardo': '60', 'loro': '61', 'mariposa': '62',
  'medusa': '63', 'morrocoy': '64', 'murciélago': '65', 'murcielago': '65', 'nutria': '66',
  'ñu': '67', 'nu': '67', 'orangután': '68', 'orangutan': '68', 'ornitorrinco': '69',
  'panda': '70', 'pelícano': '71', 'pelicano': '71', 'pingüino': '72', 'pinguino': '72',
  'puma': '73', 'rinoceronte': '74', 'guácharo': '75', 'guacharo': '75',
  'salamandra': '76', 'delfín rosado': '77', 'delfin rosado': '77', 'serpiente': '78',
  'suricato': '79', 'tapir': '80', 'tiburón': '81', 'tiburon': '81', 'tortuga': '82',
  'tucán': '83', 'tucan': '83', 'urraca': '84', 'orca': '85', 'vampiro': '86',
  'canguro': '87', 'koala': '88', 'búfalo': '89', 'bufalo': '89', 'camaleón': '90',
  'camaleon': '90', 'carpincho': '91', 'castor': '92', 'comadreja': '93', 'coyote': '94',
  'erizo': '95', 'caballito de mar': '96', 'foca': '97', 'ganso': '98', 'guacharito': '99'
};

const LOTTERY_MAPPING = {
  'lotto activo': 'lotto_activo',
  'la granjita': 'granjita',
  'granjita': 'granjita',
  'lotto rey': 'lotto_rey',
  'selva plus': 'selva_plus',
  'guácharo activo': 'guacharo',
  'guacharo activo': 'guacharo',
  'guacharo': 'guacharo',
  'guacharito': 'guacharito'
};

function syncLotteryResults() {
  const today = Utilities.formatDate(new Date(), 'America/Caracas', 'yyyy-MM-dd');
  const url = `https://loteriadehoy.com/animalitos/resultados/${today}/`;
  
  try {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return;
    
    let html = response.getContentText();

    // SOLUCIÓN PUNTO 1 Y 3: RECORTAR EL HTML PARA IGNORAR MENÚS
    // Buscamos el div central donde están los resultados de verdad
    const startTag = 'id="pills-tabContent"';
    const startIndex = html.indexOf(startTag);
    if (startIndex !== -1) {
      html = html.substring(startIndex); // Tiramos a la basura todo lo que esté antes (menús)
      Logger.log("HTML recortado con éxito para evitar el menú.");
    }

    const results = parseResults(html, today);
    if (results.length === 0) return;
    
    for (const result of results) {
      sendToSupabase(result);
    }
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}

function parseResults(html, date) {
  const results = [];
  // Buscamos bloques que contengan resultados (divs o filas de tabla)
  const blocks = html.match(/<(?:div|tr)[^>]*>[\s\S]*?<\/(?:div|tr)>/gi) || [];
  
  for (const block of blocks) {
    // 1. Identificar Lotería
    let lotteryName = '';
    const lotteryMatch = block.match(/(lotto\s*activo|granjita|la\s*granjita|lotto\s*rey|selva\s*plus|gu[aá]charo|guacharito)/gi);
    if (!lotteryMatch) continue;
    lotteryName = lotteryMatch[0].toLowerCase().trim();

    // 2. Identificar Hora
    let drawTime = '';
    const timeMatch = block.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
    if (!timeMatch) continue;
    drawTime = normalizeTime(timeMatch[1]);

    // 3. Identificar Animal
    let animalName = '';
    for (const animal of Object.keys(ANIMAL_MAPPING)) {
      const regex = new RegExp(`\\b${animal}\\b`, 'i');
      if (regex.test(block)) {
        animalName = animal.toLowerCase();
        break;
      }
    }

    if (lotteryName && drawTime && animalName) {
      const lotteryId = LOTTERY_MAPPING[lotteryName] || lotteryName.replace(/\s+/g, '_');
      
      // SOLUCIÓN PUNTO 2: NORMALIZACIÓN DE 2 DÍGITOS (7 -> 07)
      let resultNumber = ANIMAL_MAPPING[animalName] || '';
      if (resultNumber.length === 1) resultNumber = '0' + resultNumber;

      results.push({
        lottery_type: lotteryId,
        draw_date: date,
        draw_time: drawTime,
        result_number: resultNumber,
        animal_name: animalName.charAt(0).toUpperCase() + animalName.slice(1)
      });
    }
  }

  // Eliminar duplicados
  const unique = [];
  const seen = new Set();
  for (const res of results) {
    const key = `${res.lottery_type}-${res.draw_time}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(res);
    }
  }
  return unique;
}

function normalizeTime(timeStr) {
  const cleaned = timeStr.toUpperCase().trim();
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  let period = match[3] || (hours >= 12 ? 'PM' : 'AM');
  if (hours > 12) hours -= 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
}

function sendToSupabase(result) {
  const endpoint = `${SUPABASE_URL}/rest/v1/lottery_results`;
  const options = {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    payload: JSON.stringify(result),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    if (response.getResponseCode() < 300) {
      Logger.log(`✓ OK: ${result.lottery_type} ${result.draw_time} -> ${result.result_number}`);
    }
  } catch (e) {
    Logger.log(`✗ Error: ${e.message}`);
  }
}
