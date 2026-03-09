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
    let id = localStorage.getItem('animalytics_device_fingerprint');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', id);
    }
    return id;
  };

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    const cleanCode = accessCode.trim().toUpperCase();
    
    if (cleanCode === "GANADOR2026") {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      toast.success("¡BIENVENIDO JEFE!");
      return;
    }

    try {
      const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
      if (!codeData) return toast.error("CÓDIGO NO VÁLIDO");

      const ahora = new Date();
      const ultimo = codeData.last_ping ? new Date(codeData.last_ping) : null;
      if (codeData.current_device_id && codeData.current_device_id !== deviceId && ultimo && (ahora.getTime() - ultimo.getTime()) < 180000) {
        return toast.error("CÓDIGO EN USO EN OTRO DISPOSITIVO");
      }

      await supabase.from('access_codes').update({ current_device_id: deviceId, last_ping: ahora.toISOString() }).eq('code', cleanCode);
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success("ACCESO CONCEDIDO");
    } catch (err) {
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const saved = localStorage.getItem('session_access_code');
        if (saved) {
          setIsLoggedIn(true);
          setUserRole(saved === "GANADOR2026" ? "admin" : "user");
        }
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-black text-primary uppercase italic">Iniciando Búnker...</div>
      </div>
    );
  }

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={() => { localStorage.removeItem('session_access_code'); setIsLoggedIn(false); }} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
