import { createClient } from '@supabase/supabase-js';

// Usamos variables de entorno para máxima seguridad en Netlify
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si las variables no cargan por algún motivo, el sistema dará aviso en consola
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ERROR: Faltan las llaves de Supabase en las variables de entorno.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
