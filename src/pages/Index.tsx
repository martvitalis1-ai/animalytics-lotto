import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; 
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [tenantAgency, setTenantAgency] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem('session_access_code');
      if (saved) {
        setIsLoggedIn(true);
        // Lógica para devolverte tus poderes de Admin
        if (saved === "GANADOR2026") setUserRole("admin");
        else setUserRole("user");
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={() => { localStorage.clear(); setIsLoggedIn(false); }} tenantAgency={tenantAgency} />
  ) : (
    <LoginScreen onLogin={(role) => { setIsLoggedIn(true); setUserRole(role); }} />
  );
};

export default Index;
