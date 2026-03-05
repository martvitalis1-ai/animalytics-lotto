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

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    const ADMIN_CODE = "GANADOR2026";
    
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', accessCode)
        .single();

      if (error || !codeData) {
        toast.error("CÓDIGO NO VÁLIDO");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // EXCEPCIÓN ADMIN: GANADOR2026 no se bloquea nunca
      const esAdminMaster = accessCode === ADMIN_CODE;

      if (
        !esAdminMaster && 
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("CÓDIGO EN USO: Ya hay otra sesión activa con este código.");
        return;
      }

      // Actualizamos los datos en Supabase
      await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', accessCode);

      // Guardamos sesión local
      localStorage.setItem('session_access_code', accessCode);
      setUserRole(esAdminMaster ? "admin" : role);
      setIsLoggedIn(true);
      
      toast.success(esAdminMaster ? "¡BIENVENIDO JEFE!" : "Acceso Concedido");

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    }
  };

  const handleLogout = async () => {
    const accessCode = localStorage.getItem('session_access_code');
    if (accessCode && accessCode !== "GANADOR2026") {
      await supabase
        .from('access_codes')
        .update({ current_device_id: null, last_ping: null })
        .eq('code', accessCode);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedCode = localStorage.getItem('session_access_code');
        if (savedCode) {
          setIsLoggedIn(true);
          setUserRole(savedCode === "GANADOR2026" ? "admin" : "user");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) return null;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role, code) => handleLogin(role, code)} />;
  }

  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
