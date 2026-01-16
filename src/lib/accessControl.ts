import { supabase } from "@/integrations/supabase/client";

export const ADMIN_CODE = "GANADOR85";

// Fallback local por si falla la red
const LOCAL_CODES = ["ANIMAL-01", "ANIMAL-02", "SUERTE-01", "GANAR-01"];

export const checkAccess = async (code: string): Promise<{ valid: boolean; role: string | null }> => {
  const cleanCode = code.trim().toUpperCase();
  
  // 1. Verificación Admin Inmediata
  if (cleanCode === ADMIN_CODE) {
    return { valid: true, role: 'admin' };
  }

  try {
    // 2. Verificación en Base de Datos
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .eq('code', cleanCode)
      .single();

    if (error || !data) {
      // Fallback local si no hay DB
      if (LOCAL_CODES.includes(cleanCode)) {
        return { valid: true, role: 'user' };
      }
      return { valid: false, role: null };
    }

    if (!data.is_active) {
      return { valid: false, role: null }; // Usuario bloqueado
    }

    return { valid: true, role: data.role || 'user' };
  } catch (e) {
    console.error("Error validando código:", e);
    // Fallback local en caso de error de red
    if (LOCAL_CODES.includes(cleanCode)) {
      return { valid: true, role: 'user' };
    }
    return { valid: false, role: null };
  }
};

export const verifyAdminCode = (code: string): boolean => {
  return code.trim().toUpperCase() === ADMIN_CODE;
};
