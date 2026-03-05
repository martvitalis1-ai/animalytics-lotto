import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 1. GENERAR HUELLA DIGITAL DEL DISPOSITIVO
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('animalytics_device_fingerprint');
    if (!deviceId) {
      // Creamos un ID único que durará para siempre en este navegador/celular
      deviceId = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', deviceId);
    }
    return deviceId;
  };

  // 2. LÓGICA DE LOGIN CON VALIDACIÓN DE DISPOSITIVO ÚNICO
  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    
    try {
      // Consultamos si el código existe
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .single();

      if (error || !codeData) {
        toast.error("CÓDIGO NO VÁLIDO. Verifica e intenta de nuevo.");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // REGLA DE BLOQUEO: 
      // Si el código ya tiene un ID de dispositivo asignado
      // Y no es este dispositivo
      // Y el último aviso de actividad (ping) fue hace menos de 3 minutos...
      if (
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("ACCESO DENEGADO: Este código ya está siendo usado en otro dispositivo.");
        return;
      }

      // Si pasamos la prueba, nos adueñamos del código en la base de datos
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', accessCode);

      if (updateError) throw updateError;

      // Guardamos en memoria local para que la sesión persista
      localStorage.setItem('session_access_code', accessCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success("¡Acceso concedido! Bienvenido.");

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión con el servidor.");
    }
  };

  const handleLogout = async () => {
    const accessCode = localStorage.getItem('session_access_code');
    if (accessCode) {
      // Liberamos el código en Supabase para que pueda ser usado en otro lado de inmediato
      await supabase
        .from('access_codes')
        .update({ current_device_id: null, last_ping: null })
        .eq('code', accessCode);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  // 3. PERSISTENCIA: Si ya estaba logueado, no pedir código de nuevo
  useEffect(() => {
    const savedCode = localStorage.getItem('session_access_code');
    if (savedCode) {
      // Podrías re-validar aquí, por ahora lo dejamos pasar
      setIsLoggedIn(true);
      setUserRole("user");
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!isLoggedIn) {
    // Aquí es donde sucede la magia: pasamos la nueva función handleLogin
    return <LoginScreen onLogin={(role, code) => handleLogin(role, code)} />;
  }

  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
