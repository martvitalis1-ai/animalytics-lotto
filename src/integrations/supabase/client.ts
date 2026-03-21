import { createClient } from '@supabase/supabase-js';

// ESTA ES TU URL REAL DEL PROYECTO ORIGINAL
const supabaseUrl = "https://qfdrmyuuswiubsppyjrt.supabase.co";
const supabaseAnonKey = "PEGA_AQUI_TU_LLAVE_ANON_LARGA"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
