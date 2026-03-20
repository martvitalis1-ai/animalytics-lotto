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

  const getDeviceId = () => {
    let id = localStorage.getItem('animalytics_device_fingerprint');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', id);
    }
    return id;
  };

  useEffect(() => {
    const checkTenant = async () => {
      const ref = searchParams.get("ref");
      if (ref) {
        const { data } = await supabase.from('agencias').select('*').eq('slug', ref.toLowerCase().trim()).maybeSingle();
        if (data) {
          setTenantAgency(data);
          localStorage.setItem('tenant_agency_id', data.id);
        }
      } else {
        const savedId = localStorage.getItem('tenant_agency_id');
        if (savedId) {
          const { data } = await supabase.from('agencias').select('*').eq('id', savedId).maybeSingle();
          if (data) setTenantAgency(data);
        }
      }
    };
    checkTenant();
  }, [searchParams]);

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId();
    const ADMIN_CODE = "GANADOR2026";
    const cleanCode = accessCode.toUpperCase().trim();
    
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      await supabase.from('access_codes').update({ current_device_id: deviceId, last_ping: new Date().toISOString() }).eq('code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      toast.success("¡BIENVENIDO JEFE MAESTRO!");
      return;
    }

    const { data: agencyOwner } = await supabase.from('agencias').select('*').eq('llave_agencia', cleanCode).maybeSingle();
    if (agencyOwner) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agencyOwner.id);
      setUserRole("agency_manager");
      setIsLoggedIn(true);
      toast.success(`BIENVENIDO DUEÑO DE ${agencyOwner.nombre.toUpperCase()}`);
      return;
    }

    try {
      const { data: codeData } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
      if (codeData) {
        await supabase.from('access_codes').update({ current_device_id: deviceId, last_ping: new Date().toISOString() }).eq('code', cleanCode);
        localStorage.setItem('session_access_code', cleanCode);
        setUserRole(role);
        setIsLoggedIn(true);
        toast.success("ACCESO CONCEDIDO.");
      } else { toast.error("CÓDIGO NO ENCONTRADO"); }
    } catch (err) { toast.error("ERROR DE CONEXIÓN"); }
  };

  const handleLogout = async () => {
    const code = localStorage.getItem('session_access_code');
    if (code && code !== "GANADOR2026") {
      await supabase.from('access_codes').update({ current_device_id: null, last_ping: null }).eq('code', code);
    }
    localStorage.removeItem('session_access_code');
    localStorage.removeItem('agency_owner_id');
    setIsLoggedIn(false);
  };

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

  if (loading) return null;

  return isLoggedIn ? (
    <Dashboard userRole={userRole} onLogout={handleLogout} tenantAgency={tenantAgency} />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};
export default Index;
