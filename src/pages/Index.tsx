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
    let isMounted = true;

    const checkSession = async () => {
      try {
        const saved = localStorage.getItem('session_access_code');
        if (!saved) return;

        if (!isMounted) return;
        setIsLoggedIn(true);

        if (saved === "GANADOR2026") {
          if (isMounted) setUserRole("admin");
          return;
        }

        const { data, error } = await (supabase.from as any)('agencias')
          .select('id,nombre,llave_agencia')
          .eq('llave_agencia', saved)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('Error restoring agency session:', error);
          setUserRole("user");
          setTenantAgency(null);
          return;
        }

        setUserRole(data ? "agency_manager" : "user");
        setTenantAgency(data ?? null);
      } catch (error) {
        console.error('Unexpected session restore error:', error);
        if (isMounted) {
          setIsLoggedIn(false);
          setUserRole("");
          setTenantAgency(null);
          localStorage.removeItem('session_access_code');
          localStorage.removeItem('agency_owner_id');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (role: string, accessCode: string) => {
    const cleanCode = accessCode.toUpperCase().trim();
    if (cleanCode === "GANADOR2026") {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      setTenantAgency(null);
      return;
    }

    try {
      const { data: agency, error: agencyError } = await supabase
        .from('agencias')
        .select('*')
        .eq('llave_agencia', cleanCode)
        .maybeSingle();

      if (agencyError) {
        console.error('Agency lookup failed:', agencyError);
      }

      if (agency) {
        localStorage.setItem('session_access_code', cleanCode);
        localStorage.setItem('agency_owner_id', agency.id);
        setTenantAgency(agency);
        setUserRole("agency_manager");
        setIsLoggedIn(true);
        return;
      }

      const { data: codeData, error: codeError } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (codeError) {
        console.error('Access code lookup failed:', codeError);
      }

      if (codeData) {
        localStorage.setItem('session_access_code', cleanCode);
        setTenantAgency(null);
        setUserRole("user");
        setIsLoggedIn(true);
      } else {
        toast.error("CÓDIGO INVÁLIDO");
      }
    } catch (error) {
      console.error('Login flow failed:', error);
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Cargando acceso...</p>
        </div>
      </div>
    );
  }

  return isLoggedIn ? (
    <Dashboard
      userRole={userRole}
      onLogout={() => {
        localStorage.clear();
        setTenantAgency(null);
        setIsLoggedIn(false);
      }}
      tenantAgency={tenantAgency}
    />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
