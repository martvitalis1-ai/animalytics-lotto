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
    const checkTenant = async () => {
      const ref = searchParams.get("ref");
      if (ref) {
        const { data } = await supabase.from('agencias').select('*').eq('slug', ref.toLowerCase().trim()).maybeSingle();
        if (data) {
          setTenantAgency(data);
          localStorage.setItem('tenant_agency_id', data.id);
        }
      }
    };
    checkTenant();
  }, [searchParams]);

  const handleLogin = async (role: string, accessCode: string) => {
    const ADMIN_CODE = "GANADOR2026";
    const cleanCode = accessCode.toUpperCase().trim();
    
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      return;
    }

    const { data: agencyOwner } = await supabase.from('agencias').select('*').eq('llave_agencia', cleanCode).maybeSingle();
    if (agencyOwner) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agencyOwner.id);
      setUserRole("agency_manager");
      setIsLoggedIn(true);
      return;
    }

    try {
      const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
      if (codeData) {
        localStorage.setItem('session_access_code', cleanCode);
        setUserRole(role);
        setIsLoggedIn(true);
      } else { toast.error("CÓDIGO NO VÁLIDO"); }
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

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={() => { localStorage.clear(); setIsLoggedIn(false); }} tenantAgency={tenantAgency} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
