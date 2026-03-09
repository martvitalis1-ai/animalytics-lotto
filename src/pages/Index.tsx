import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Función para obtener la huella única del dispositivo
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
    const cleanCode = accessCode.trim().toUpperCase();
    
    // 1. SI ES EL JEFE, ENTRA DIRECTO SIN BLOQUEOS
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      toast.success("¡BIENVENIDO JEFE! ACCESO MAESTRO.");
      return;
    }

    // 2. VALIDACIÓN PARA USUARIOS NORMALES
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error || !codeData) {
        toast.error("CÓDIGO NO VÁLIDO");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      // BLOQUEO SI ESTÁ EN USO (3 MINUTOS DE GRACIA)
      if (
        codeData.current_device_id && 
        codeData.current_device_id !== deviceId &&
        ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000 
      ) {
        toast.error("CÓDIGO EN USO EN OTRO DISPOSITIVO");
        return;
      }

      // REGISTRAMOS ESTE DISPOSITIVO COMO DUEÑO
      await supabase
        .from('access_codes')
        .update({ 
          current_device_id: deviceId,
          last_ping: ahora.toISOString()
        })
        .eq('code', cleanCode);

      localStorage.setItem('session_access_code', cleanCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success("ACCESO CONCEDIDO");

    } catch (err) {
      console.error("Error login:", err);
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  const handleLogout = async () => {
    const code = localStorage.getItem('session_access_code');
    // El admin no libera código para no perder sus otras sesiones
    if (code && code !== "GANADOR2026") {
      await supabase.from('access_codes').update({ 
        current_device_id: null, 
        last_ping: null 
      }).eq('code', code);
    }
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  // CHEQUEO DE SESIÓN AL INICIAR
  useEffect(() => {
    const checkSession = async () => {
      try {
        const saved = localStorage.getItem('session_access_code');
        if (saved) {
          setIsLoggedIn(true);
          setUserRole(saved === "GANADOR2026" ? "admin" : "user");
        }
      } catch (e) {
        console.error("Error session check:", e);
      } finally {
        // MUY IMPORTANTE: Siempre apagamos el loading para que la app se muestre
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
    <Dashboard userRole={userRole} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
