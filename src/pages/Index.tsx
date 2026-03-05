import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 1. Obtener o crear huella del dispositivo
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('animalytics_device_fingerprint');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', deviceId);
    }
    return deviceId;
  };

  // 2. Función de validación de dispositivo único
  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    
    try {
      // Consultamos el estado actual del código en Supabase
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .single();

      if (error || !codeData) {
        toast.error("Código no válido en el servidor.");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // REGLA: Bloquear si hay otro dispositivo activo hace menos de 3 minutos
      if (
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("CÓDIGO EN USO: Ya hay otra sesión activa con este código.");
        return;
      }

      // Si el acceso es válido, registramos este dispositivo como el dueño actual
      const { error: updateError } = await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', accessCode);

      if (updateError) throw updateError;

      // Todo bien, logueamos
      localStorage.setItem('session_access_code', accessCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success(role === 'admin' ? "¡Hola Jefe!" : "Acceso Exitoso");

    } catch (err) {
      console.error(err);
      toast.error("Error al sincronizar con el servidor.");
    }
  };

  const handleLogout = async () => {
    const accessCode = localStorage.getItem('session_access_code');
    if (accessCode) {
      // Liberamos el código para que otro pueda usarlo de inmediato
      await supabase
        .from('access_codes')
        .update({ current_device_id: null, last_ping: null })
        .eq('code', accessCode);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  // Persistencia de sesión (opcional)
  useEffect(() => {
    const savedCode = localStorage.getItem('session_access_code');
    if (savedCode) {
      setIsLoggedIn(true);
      setUserRole("user"); 
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role, code) => handleLogin(role, code)} />;
  }

  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
