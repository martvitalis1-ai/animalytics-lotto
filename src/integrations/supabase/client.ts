import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Esto lee las variables que pusimos en el paso anterior
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si por alguna razón las variables fallan, este IF evita que la App se quede en blanco eterno
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ERROR CRÍTICO: Faltan las llaves de Supabase en Environment Variables");
}

export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "");
