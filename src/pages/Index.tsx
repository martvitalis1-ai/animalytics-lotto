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

  // 🛠️ FUNCIÓN MAESTRA: GENERAR HUELLA DEL DISPOSITIVO
  const getDeviceId = () => {
    let id = localStorage.getItem('animalytics_device_fingerprint');
    if (!id) {
      // Creamos una huella única para este teléfono/PC
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
      }
    };
    checkTenant();
  }, [searchParams]);

  const handleLogin = async (role: string, accessCode: string) => {
    const deviceId = getDeviceId(); // Obtenemos la huella antes de entrar
    const ADMIN_CODE = "GANADOR2026";
    const cleanCode = accessCode.toUpperCase().trim();
    
    // 1. ADMIN MAESTRO
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      // Registramos el ping del admin para que usted también aparezca en el radar
      await supabase.from('access_codes').update({ 
        current_device_id: deviceId, 
        last_ping: new Date().toISOString() 
      }).eq('code', cleanCode);

      setUserRole("admin");
      setIsLoggedIn(true);
      return;
    }

    // 2. DUEÑOS DE AGENCIA
    const { data: agency } = await supabase.from('agencias').select('*').eq('llave_agencia', cleanCode).maybeSingle();
    if (agency) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agency.id);
      setUserRole("agency_manager");
      setIsLoggedIn(true);
      return;
    }

    // 3. USUARIOS NORMALES (BLINDAJE DE DISPOSITIVO)
    try {
      const { data: codeData, error } = await supabase.from('access_codes').select('*').eq('code', cleanCode).maybeSingle();
      
      if (codeData) {
        // ACTUALIZAMOS EL RADAR EN SUPABASE AL ENTRAR
        await supabase.from('access_codes').update({ 
          current_device_id: deviceId,
          last_ping: new Date().toISOString()
        }).eq('code', cleanCode);

        localStorage.setItem('session_access_code', cleanCode);
        setUserRole("user");
        setIsLoggedIn(true);
        toast.success("ACCESO CONCEDIDO");
      } else { 
        toast.error("CÓDIGO NO VÁLIDO"); 
      }
    } catch (err) { toast.error("ERROR DE CONEXIÓN CON EL BÚNKER"); }
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
