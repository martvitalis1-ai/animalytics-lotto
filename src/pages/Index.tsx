import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        if (saved === "GANADOR2026") setUserRole("admin");
        else {
          const { data } = await supabase.from('agencias').select('id').eq('llave_agencia', saved).maybeSingle();
          setUserRole(data ? "agency_manager" : "user");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const handleLogin = async (role: string, accessCode: string) => {
    const cleanCode = accessCode.toUpperCase().trim();
    if (cleanCode === "GANADOR2026") {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      return;
    }
    const { data: agency } = await supabase.from('agencias').select('*').eq('llave_agencia', cleanCode).maybeSingle();
    if (agency) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agency.id);
      setUserRole("agency_manager");
      setIsLoggedIn(true);
      return;
    }
    const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
    if (codeData) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("user");
      setIsLoggedIn(true);
    } else {
      toast.error("CÓDIGO INVÁLIDO");
    }
  };

  if (loading) return null;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={() => { localStorage.clear(); setIsLoggedIn(false); }} tenantAgency={tenantAgency} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
