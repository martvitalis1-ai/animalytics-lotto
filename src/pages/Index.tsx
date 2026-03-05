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
      id = Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem('device_fingerprint', id);
    }
    return id;
  };

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    const ADMIN_CODE = "GANADOR2026";
    
    try {
      const { data: codeData, error } = await supabase.from('access_codes').select('*').eq('code', accessCode).single();

      if (error || !codeData) {
        toast.error("CÓDIGO INVÁLIDO");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      const esAdminMaster = accessCode === ADMIN_CODE;

      if (!esAdminMaster && codeData.current_device_id && codeData.current_device_id !== deviceId && ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000) {
        toast.error("CÓDIGO EN USO EN OTRO DISPOSITIVO");
        return;
      }

      await supabase.from('access_codes').update({ current_device_id: deviceId, last_ping: ahora.toISOString() }).eq('code', accessCode);

      localStorage.setItem('session_access_code', accessCode);
      setUserRole(esAdminMaster ? "admin" : role);
      setIsLoggedIn(true);
      toast.success(esAdminMaster ? "¡HOLA JEFE!" : "ACCESO CONCEDIDO");
    } catch (err) {
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  const handleLogout = async () => {
    const code = localStorage.getItem('session_access_code');
    if (code && code !== "GANADOR2026") {
      await supabase.from('access_codes').update({ current_device_id: null, last_ping: null }).eq('code', code);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('session_access_code');
    if (saved) {
      setIsLoggedIn(true);
      setUserRole(saved === "GANADOR2026" ? "admin" : "user");
    }
    setLoading(false);
  }, []);

  if (loading) return null;
  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
