import { createClient } from '@supabase/supabase-js';

// ESTA ES TU URL REAL DEL PROYECTO ORIGINAL
const supabaseUrl = "https://qfdrmyuuswiubsppyjrt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmZHJteXV1c3dpdWJzcHB5anJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MDU1NDEsImV4cCI6MjA4NjQ4MTU0MX0.u3afSc4T--SnAniJOcjiUdVodP1p1aFof3FjqtZNlqY"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
