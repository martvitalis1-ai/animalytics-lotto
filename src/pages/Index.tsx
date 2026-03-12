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

  // 🛡️ DETECCIÓN DE AGENCIA POR LINK (?ref=slug)
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

    // Si el código existe en la tabla de AGENCIAS, entra como MANAGER
    const { data: agency } = await supabase.from('agencias').select('*').eq('llave_agencia', cleanCode).maybeSingle();
    if (agency) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agency.id);
      setUserRole("agency_manager");
      setIsLoggedIn(true);
      return;
    }

    // Usuario normal con código VIP o gratis
    const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
    if (codeData) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("user");
      setIsLoggedIn(true);
    } else { toast.error("CÓDIGO NO VÁLIDO"); }
  };

  useEffect(() => {
    const checkSession = async () => {
      const saved = localStorage.getItem('session_access_code');
      if (saved) {
        if (saved === "GANADOR2026") {
          setUserRole("admin");
          setIsLoggedIn(true);
        } else {
          const { data } = await supabase.from('agencias').select('id').eq('llave_agencia', saved).maybeSingle();
          if (data) {
            setUserRole("agency_manager");
            setIsLoggedIn(true);
          } else {
            setUserRole("user");
            setIsLoggedIn(true);
          }
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={() => { localStorage.clear(); window.location.href="/"; }} tenantAgency={tenantAgency} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};
export default Index;
