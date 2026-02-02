import { supabase } from "@/integrations/supabase/client";

// NOTA: ADMIN_CODE se lee también desde la base de datos
// Este es un fallback local, pero la validación real ocurre server-side
export const ADMIN_CODE = "GANADOR85";

// Additional admin codes
const ADMIN_CODES = ["GANADOR85", "GANADOR2026"];

// Fallback local por si falla la red
const LOCAL_CODES = ["ANIMAL-01", "ANIMAL-02", "SUERTE-01", "GANAR-01"];

export const checkAccess = async (code: string): Promise<{ valid: boolean; role: string | null }> => {
  // Clean code: trim whitespace, uppercase, remove extra spaces
  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
  
  // 1. Verificación Admin local (fallback) - check all admin codes
  if (ADMIN_CODES.some(adminCode => cleanCode === adminCode.replace(/\s+/g, ''))) {
    return { valid: true, role: 'admin' };
  }

  try {
    // 2. Verificación en Base de Datos (server-side validation)
    const { data, error } = await supabase
      .from('access_codes')
      .select('code, role, is_active, alias')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error) {
      console.error("Error de base de datos:", error);
      // Fallback local si hay error de red
      if (LOCAL_CODES.includes(cleanCode)) {
        return { valid: true, role: 'user' };
      }
      return { valid: false, role: null };
    }

    if (!data) {
      // Código no encontrado en DB, probar fallback local
      if (LOCAL_CODES.includes(cleanCode)) {
        return { valid: true, role: 'user' };
      }
      return { valid: false, role: null };
    }

    // Verificar si está activo
    if (!data.is_active) {
      return { valid: false, role: null }; // Usuario bloqueado
    }

    // Código válido y activo
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

// Verificación de admin (server-side preferred)
export const verifyAdminCode = async (code: string): Promise<boolean> => {
  // Clean code: trim whitespace, uppercase, remove extra spaces
  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
  
  // Local fallback - check all admin codes
  if (ADMIN_CODES.some(adminCode => cleanCode === adminCode.replace(/\s+/g, ''))) {
    return true;
  }
  
  // Check database for admin role
  try {
    const { data } = await supabase
      .from('access_codes')
      .select('role, is_active')
      .eq('code', cleanCode)
      .maybeSingle();
    
    return data?.is_active === true && data?.role === 'admin';
  } catch {
    return cleanCode === ADMIN_CODE;
  }
};

// Legacy sync version for backwards compatibility
export const verifyAdminCodeSync = (code: string): boolean => {
  const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
  return ADMIN_CODES.some(adminCode => cleanCode === adminCode.replace(/\s+/g, ''));
};

// Create a new access code
export const createAccessCode = async (
  code: string,
  alias?: string,
  role: string = 'user'
): Promise<{ success: boolean; error?: string }> => {
  const cleanCode = code.trim().toUpperCase();
  
  if (cleanCode.length < 4) {
    return { success: false, error: 'El código debe tener al menos 4 caracteres' };
  }
  
  try {
    const { error } = await supabase
      .from('access_codes')
      .insert({
        code: cleanCode,
        alias: alias || null,
        role: role,
        is_active: true,
      });
    
    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Este código ya existe' };
      }
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error de conexión' };
  }
};

// Get all access codes (admin only)
export const getAllAccessCodes = async (): Promise<{
  codes: Array<{ code: string; alias: string | null; role: string; is_active: boolean; created_at: string }>;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return { codes: [], error: error.message };
    }
    
    return { codes: data || [] };
  } catch {
    return { codes: [], error: 'Error de conexión' };
  }
};

// Toggle access code status
export const toggleAccessCodeStatus = async (
  code: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('access_codes')
      .update({ is_active: isActive })
      .eq('code', code);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
};

// Delete access code
export const deleteAccessCode = async (
  code: string
): Promise<{ success: boolean; error?: string }> => {
  // Prevent deleting admin code
  if (code.trim().toUpperCase() === ADMIN_CODE) {
    return { success: false, error: 'No se puede eliminar el código de administrador' };
  }
  
  try {
    const { error } = await supabase
      .from('access_codes')
      .delete()
      .eq('code', code);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch {
    return { success: false, error: 'Error de conexión' };
  }
};
