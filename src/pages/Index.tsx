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
    const ADMIN_CODE = "GANADOR2026";
    const cleanCode = accessCode.toUpperCase().trim();
    
    // 1. VERIFICACIÓN INSTANTÁNEA DEL JEFE (Bypass de base de datos)
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      toast.success("¡BIENVENIDO JEFE! ACCESO MAESTRO CONCEDIDO.");
      
      // Intentamos registrar al admin en la DB pero no bloqueamos si falla
      await supabase.from('access_codes').update({ 
        current_device_id: deviceId, 
        last_ping: new Date().toISOString() 
      }).eq('code', cleanCode);
      
      return;
    }

    // 2. VERIFICACIÓN PARA USUARIOS NORMALES
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error || !codeData) {
        toast.error("CÓDIGO NO ENCONTRADO EN EL SISTEMA");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // Bloqueo de dispositivo compartido (3 minutos)
      if (
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("⚠️ ESTE CÓDIGO YA ESTÁ SIENDO USADO EN OTRO DISPOSITIVO");
        return;
      }

      await supabase.from('access_codes').update({ 
        current_device_id: deviceId,
        last_ping: ahora.toISOString()
      }).eq('code', cleanCode);

      localStorage.setItem('session_access_code', cleanCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success("ACCESO CONCEDIDO. ¡MUCHA MALICIA!");

    } catch (err) {
      toast.error("ERROR DE CONEXIÓN CON EL BÚNKER");
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

  if (loading) return null;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
