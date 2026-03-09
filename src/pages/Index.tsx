import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
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
    const code = accessCode.toUpperCase().trim();
    if (code === "GANADOR2026") {
      setIsLoggedIn(true); setUserRole("admin");
      localStorage.setItem('session_access_code', code);
      toast.success("¡HOLA JEFE!"); return;
    }
    try {
      const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', code).maybeSingle();
      if (!codeData) return toast.error("CÓDIGO INVÁLIDO");
      
      const ahora = new Date();
      const ultimo = codeData.last_ping ? new Date(codeData.last_ping) : null;
      if (codeData.current_device_id && codeData.current_device_id !== deviceId && ultimo && (ahora.getTime() - ultimo.getTime()) < 180000) {
        return toast.error("CÓDIGO EN USO EN OTRO DISPOSITIVO");
      }
      await supabase.from('access_codes').update({ current_device_id: deviceId, last_ping: ahora.toISOString() }).eq('code', code);
      localStorage.setItem('session_access_code', code);
      setUserRole(role); setIsLoggedIn(true);
    } catch (err) { toast.error("ERROR DE CONEXIÓN"); }
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
  return isLoggedIn ? <Dashboard userRole={userRole} onLogout={() => { localStorage.removeItem('session_access_code'); setIsLoggedIn(false); }} /> : <LoginScreen onLogin={handleLogin} />;
};

export default Index;
