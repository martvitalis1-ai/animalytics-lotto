import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const getDeviceId = () => {
    let id = localStorage.getItem('device_fingerprint');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('device_fingerprint', id);
    }
    return id;
  };

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    const ADMIN_CODE = "GANADOR2026";
    const code = accessCode.toUpperCase().trim();
    
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !codeData) {
        toast.error("CÓDIGO NO VÁLIDO");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      const esAdminMaster = code === ADMIN_CODE;

      if (!esAdminMaster && codeData.current_device_id && codeData.current_device_id !== deviceId && ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000) {
        toast.error("CÓDIGO EN USO: Ya hay otra sesión activa.");
        return;
      }

      await supabase
        .from('access_codes')
        .update({ current_device_id: deviceId, last_ping: ahora.toISOString() })
        .eq('code', code);

      localStorage.setItem('session_access_code', code);
      setUserRole(esAdminMaster ? "admin" : role);
      setIsLoggedIn(true);
      toast.success(esAdminMaster ? "¡BIENVENIDO JEFE!" : "ACCESO CONCEDIDO");

    } catch (err) {
      console.error(err);
      toast.error("Error de conexión con el servidor");
    }
  };

  const handleLogout = async () => {
    const code = localStorage.getItem('session_access_code');
    if (code && code !== "GANADOR2026") {
      await supabase.from('access_codes').update({ current_device_id: null, last_ping: null }).eq('code', code);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem('session_access_code');
      if (saved) {
        setIsLoggedIn(true);
        setUserRole(saved === "GANADOR2026" ? "admin" : "user");
      }
      setLoading(false);
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
