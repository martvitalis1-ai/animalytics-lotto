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
    
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle(); // Usamos maybeSingle para evitar errores de red rígidos

      if (error || !codeData) {
        toast.error("CÓDIGO NO ENCONTRADO EN LA BASE DE DATOS");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      const esAdminMaster = cleanCode === ADMIN_CODE;

      // SI NO ES ADMIN MASTER, BLOQUEAMOS SI ESTÁ EN USO (3 min)
      if (
        !esAdminMaster && 
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("⚠️ CÓDIGO EN USO EN OTRO DISPOSITIVO");
        return;
      }

      // REGISTRAMOS LA SESIÓN
      await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', cleanCode);

      localStorage.setItem('session_access_code', cleanCode);
      setUserRole(esAdminMaster ? "admin" : role);
      setIsLoggedIn(true);
      
      toast.success(esAdminMaster ? "¡HOLA JEFE! ACCESO TOTAL CONCEDIDO." : "ACCESO CONCEDIDO. ¡MUCHA MALICIA!");

    } catch (err) {
      console.error(err);
      toast.error("ERROR DE CONEXIÓN CON SUPABASE");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background font-black text-emerald-600 animate-pulse uppercase italic">Iniciando Animalytics Pro...</div>;

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(role, code) => handleLogin(role, code)} />;
  }

  return <Dashboard userRole={userRole} onLogout={handleLogout} />;
};

export default Index;
