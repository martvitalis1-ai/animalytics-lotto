/**
 * ============================================================
 * ANIMALYTICS PRO - Google Apps Script Scraper
 * Automatic lottery results synchronization
 * 
 * SETUP:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Paste this code
 * 4. Fill in SUPABASE_URL and SUPABASE_KEY below
 * 5. Set up a time-driven trigger to run every 10 minutes
 * ============================================================
 */

// ===== CONFIGURATION - FILL THESE IN =====
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE'; // e.g., https://xxx.supabase.co
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE'; // Your anon/public key

// ===== ANIMAL MAPPING (Master Dictionary 0-99) =====
const ANIMAL_MAPPING = {
  'delfin': '0',
  'delfín': '0',
  'ballena': '00',
  'carnero': '01',
  'toro': '02',
  'ciempiés': '03',
  'ciempies': '03',
  'alacrán': '04',
  'alacran': '04',
  'león': '05',
  'leon': '05',
  'rana': '06',
  'perico': '07',
  'ratón': '08',
  'raton': '08',
  'águila': '09',
  'aguila': '09',
  'tigre': '10',
  'gato': '11',
  'caballo': '12',
  'mono': '13',
  'paloma': '14',
  'zorro': '15',
  'oso': '16',
  'pavo': '17',
  'burro': '18',
  'chivo': '19',
  'cochino': '20',
  'gallo': '21',
  'camello': '22',
  'cebra': '23',
  'iguana': '24',
  'gallina': '25',
  'vaca': '26',
  'perro': '27',
  'zamuro': '28',
  'elefante': '29',
  'caimán': '30',
  'caiman': '30',
  'lapa': '31',
  'cabra': '32',
  'pescado': '33',
  'venado': '34',
  'jirafa': '35',
  'culebra': '36',
  // Extended (Guácharo 37-75)
  'abeja': '37',
  'araña': '38',
  'arana': '38',
  'ardilla': '39',
  'armadillo': '40',
  'babilla': '41',
  'ballena azul': '42',
  'buho': '43',
  'búho': '43',
  'caballo de mar': '44',
  'cangrejo': '45',
  'chigüire': '46',
  'chiguire': '46',
  'cocodrilo': '47',
  'cotorra': '48',
  'perezoso': '49',
  'danta': '50',
  'flamenco': '51',
  'gaviota': '52',
  'gorila': '53',
  'guacamaya': '54',
  'hipopótamo': '55',
  'hipopotamo': '55',
  'hormiga': '56',
  'jaguar': '57',
  'langosta': '58',
  'lechuza': '59',
  'leopardo': '60',
  'loro': '61',
  'mariposa': '62',
  'medusa': '63',
  'morrocoy': '64',
  'murciélago': '65',
  'murcielago': '65',
  'nutria': '66',
  'ñu': '67',
  'nu': '67',
  'orangután': '68',
  'orangutan': '68',
  'ornitorrinco': '69',
  'panda': '70',
  'pelícano': '71',
  'pelicano': '71',
  'pingüino': '72',
  'pinguino': '72',
  'puma': '73',
  'rinoceronte': '74',
  'guácharo': '75',
  'guacharo': '75',
  // Guacharito Extended (76-99)
  'salamandra': '76',
  'delfín rosado': '77',
  'delfin rosado': '77',
  'serpiente': '78',
  'suricato': '79',
  'tapir': '80',
  'tiburón': '81',
  'tiburon': '81',
  'tortuga': '82',
  'tucán': '83',
  'tucan': '83',
  'urraca': '84',
  'orca': '85',
  'vampiro': '86',
  'canguro': '87',
  'koala': '88',
  'búfalo': '89',
  'bufalo': '89',
  'camaleón': '90',
  'camaleon': '90',
  'carpincho': '91',
  'castor': '92',
  'comadreja': '93',
  'coyote': '94',
  'erizo': '95',
  'caballito de mar': '96',
  'foca': '97',
  'ganso': '98',
  'guacharito': '99'
};

// ===== LOTTERY MAPPING =====
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

/**
 * Main function to scrape and sync lottery results
 */
function syncLotteryResults() {
  const today = Utilities.formatDate(new Date(), 'America/Caracas', 'yyyy-MM-dd');
  const url = `https://loteriadehoy.com/animalitos/resultados/${today}/`;
  
  Logger.log(`Fetching results from: ${url}`);
  
  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
    
    const statusCode = response.getResponseCode();
    if (statusCode !== 200) {
      Logger.log(`Error fetching page: HTTP ${statusCode}`);
      return;
    }
    
    const html = response.getContentText();
    const results = parseResults(html, today);
    
    if (results.length === 0) {
      Logger.log('No results found to sync');
      return;
    }
    
    Logger.log(`Found ${results.length} results to sync`);
    
    // Send to Supabase
    for (const result of results) {
      sendToSupabase(result);
    }
    
    Logger.log('Sync completed successfully!');
    
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
    // Will retry on next execution
  }
}

/**
 * Parse HTML to extract lottery results
 */
function parseResults(html, date) {
  const results = [];
  
  // Regex patterns for different lottery formats
  // Pattern: Look for lottery name, time, and animal/number
  const lotteryBlocks = html.match(/<div[^>]*class="[^"]*resultado[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
  
  // Alternative: Look for table rows with results
  const tableRows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
  
  // Process each potential result block
  const allBlocks = [...lotteryBlocks, ...tableRows];
  
  for (const block of allBlocks) {
    // Extract lottery name
    let lotteryName = '';
    const lotteryMatch = block.match(/(lotto\s*activo|granjita|la\s*granjita|lotto\s*rey|selva\s*plus|gu[aá]charo(?:\s*activo)?|guacharito)/gi);
    if (lotteryMatch) {
      lotteryName = lotteryMatch[0].toLowerCase().trim();
    }
    
    // Extract time (formats: 8:00 AM, 08:00, 8:00am, etc.)
    let drawTime = '';
    const timeMatch = block.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
    if (timeMatch) {
      drawTime = normalizeTime(timeMatch[1]);
    }
    
    // Extract animal name
    let animalName = '';
    for (const animal of Object.keys(ANIMAL_MAPPING)) {
      const regex = new RegExp(`\\b${animal}\\b`, 'i');
      if (regex.test(block)) {
        animalName = animal.toLowerCase();
        break;
      }
    }
    
    // Skip if missing required data
    if (!lotteryName || !drawTime || !animalName) {
      continue;
    }
    
    const lotteryId = LOTTERY_MAPPING[lotteryName] || lotteryName.replace(/\s+/g, '_');
    const resultNumber = ANIMAL_MAPPING[animalName] || '';
    
    if (resultNumber) {
      results.push({
        lottery_type: lotteryId,
        draw_date: date,
        draw_time: drawTime,
        result_number: resultNumber,
        animal_name: animalName.charAt(0).toUpperCase() + animalName.slice(1)
      });
    }
  }
  
  // Remove duplicates
  const unique = [];
  const seen = new Set();
  
  for (const result of results) {
    const key = `${result.lottery_type}-${result.draw_date}-${result.draw_time}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }
  
  return unique;
}

/**
 * Normalize time format to "HH:MM AM/PM"
 */
function normalizeTime(timeStr) {
  const cleaned = timeStr.toUpperCase().trim();
  
  // Extract hours and minutes
  const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return timeStr;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  let period = match[3] || '';
  
  // Determine AM/PM if not specified
  if (!period) {
    period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
  }
  
  // Format consistently
  const formattedHours = hours.toString().padStart(2, '0');
  return `${formattedHours}:${minutes} ${period}`;
}

/**
 * Send result to Supabase
 */
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
    const statusCode = response.getResponseCode();
    
    if (statusCode >= 200 && statusCode < 300) {
      Logger.log(`✓ Inserted: ${result.lottery_type} - ${result.draw_time} - ${result.result_number}`);
    } else if (statusCode === 409) {
      Logger.log(`○ Already exists: ${result.lottery_type} - ${result.draw_time}`);
    } else {
      Logger.log(`✗ Error ${statusCode}: ${response.getContentText()}`);
    }
  } catch (error) {
    Logger.log(`✗ Failed to insert: ${error.message}`);
  }
}

/**
 * Test function - run manually to verify setup
 */
function testSetup() {
  Logger.log('Testing Animalytics Scraper Setup...');
  
  // Check configuration
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    Logger.log('ERROR: Please set your SUPABASE_URL');
    return;
  }
  
  if (SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    Logger.log('ERROR: Please set your SUPABASE_KEY');
    return;
  }
  
  Logger.log('Configuration OK!');
  Logger.log(`Supabase URL: ${SUPABASE_URL}`);
  
  // Try to fetch today's results
  syncLotteryResults();
}

/**
 * Set up automatic trigger (run once)
 */
function createTrigger() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'syncLotteryResults') {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  
  // Create new trigger - every 10 minutes
  ScriptApp.newTrigger('syncLotteryResults')
    .timeBased()
    .everyMinutes(10)
    .create();
  
  Logger.log('Trigger created: syncLotteryResults will run every 10 minutes');
}
