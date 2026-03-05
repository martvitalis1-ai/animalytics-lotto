import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedCode = localStorage.getItem('session_access_code');
        if (savedCode) {
          setIsLoggedIn(true);
          setUserRole(savedCode === "GANADOR2026" ? "admin" : "user");
        }
      } catch (e) {
        console.error("Error en sesión:", e);
      } finally {
        // ESTA LÍNEA ES EL SALVAVIDAS: obliga a la app a encender
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = async (role: string, accessCode: string) => {
    const code = accessCode.toUpperCase().trim();
    try {
      const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', code).maybeSingle();

      if (!codeData) {
        toast.error("CÓDIGO INVÁLIDO");
        return;
      }

      localStorage.setItem('session_access_code', code);
      setUserRole(code === "GANADOR2026" ? "admin" : role);
      setIsLoggedIn(true);
      toast.success("BIENVENIDO");
    } catch (err) {
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('session_access_code');
    setIsLoggedIn(false);
    setUserRole("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background font-black text-primary animate-pulse uppercase">Cargando Sistema...</div>;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={handleLogout} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
