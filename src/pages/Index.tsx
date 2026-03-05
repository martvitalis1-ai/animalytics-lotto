import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Generar o recuperar huella única del dispositivo
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('animalytics_device_fingerprint');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', deviceId);
    }
    return deviceId;
  };

  const handleLogin = async (role: string, accessCode?: string) => {
    // Si el login viene con un código (desde LoginScreen), validamos sesión única
    if (accessCode) {
      const deviceId = getDeviceId();
      
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .single();

      if (error || !codeData) {
        toast.error("Código de acceso no válido");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // BLOQUEO: Si hay otro dispositivo activo en los últimos 3 minutos
      if (
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("ERROR: Este código ya está en uso en otro dispositivo.");
        return;
      }

      // Tomamos posesión del código
      await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', accessCode);

      localStorage.setItem('session_access_code', accessCode);
    }

    setUserRole(role);
    setIsLoggedIn(true);
    setLoading(false);
  };

  const handleLogout = async () => {
    const accessCode = localStorage.getItem('session_access_code');
    if (accessCode) {
      // Liberamos el código al cerrar sesión voluntariamente
      await supabase
        .from('access_codes')
        .update({ current_device_id: null, last_ping: null })
        .eq('code', accessCode);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role) => handleLogin(role, (window as any).tempCode)} />;
    // Nota: Asegúrate que tu LoginScreen guarde el código en window.tempCode o pásalo por la función onLogin
  }

  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
