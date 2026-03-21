import { createClient } from '@supabase/supabase-js';

// METEMOS LOS DATOS A LA FUERZA PARA SALTARNOS EL ERROR
const supabaseUrl = "https://qfdrmyuuswiubsppyjrt.supabase.co";
const supabaseAnonKey = "COPIA_AQUI_TU_LLAVE_ANOM_LARGA_QUE_EMPIEZA_CON_EYJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
