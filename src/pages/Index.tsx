import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // IMPORTANTE: Para leer el /?ref=slug
import { LoginScreen } from "@/components/LoginScreen";
import { Dashboard } from "@/components/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // ESTADO CRÍTICO: Información de la agencia dueña (si se entra por link de afiliado)
  const [tenantAgency, setTenantAgency] = useState<any>(null);

  const getDeviceId = () => {
    let id = localStorage.getItem('animalytics_device_fingerprint');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      localStorage.setItem('animalytics_device_fingerprint', id);
    }
    return id;
  };

  // 🛡️ DETECCIÓN DE AGENCIA POR URL (animalytics.pro/?ref=slug)
  useEffect(() => {
    const checkTenant = async () => {
      const ref = searchParams.get("ref");
      if (ref) {
        const { data } = await supabase
          .from('agencias')
          .select('*')
          .eq('slug', ref.toLowerCase().trim())
          .maybeSingle();
        
        if (data) {
          setTenantAgency(data);
          // Guardamos en memoria para que persista aunque recargue sin el ref
          localStorage.setItem('tenant_agency_id', data.id);
        }
      } else {
        // Si no hay ref en URL, vemos si hay uno guardado previamente
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
    
    // 1. VERIFICACIÓN DEL JEFE SUPREMO
    if (cleanCode === ADMIN_CODE) {
      localStorage.setItem('session_access_code', cleanCode);
      setUserRole("admin");
      setIsLoggedIn(true);
      toast.success("¡BIENVENIDO JEFE MAESTRO!");
      return;
    }

    // 2. VERIFICACIÓN PARA DUEÑOS DE AGENCIA (Alquiler)
    // Buscamos si el código ingresado coincide con alguna 'llave_agencia'
    const { data: agencyOwner } = await supabase
      .from('agencias')
      .select('*')
      .eq('llave_agencia', cleanCode)
      .maybeSingle();

    if (agencyOwner) {
      localStorage.setItem('session_access_code', cleanCode);
      localStorage.setItem('agency_owner_id', agencyOwner.id);
      setUserRole("agency_manager"); // ROL RESTRINGIDO
      setIsLoggedIn(true);
      toast.success(`BIENVENIDO DUEÑO DE ${agencyOwner.nombre.toUpperCase()}`);
      return;
    }

    // 3. VERIFICACIÓN PARA USUARIOS NORMALES
    try {
      const { data: codeData, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code', cleanCode)
        .maybeSingle();

      if (error || !codeData) {
        toast.error("CÓDIGO NO ENCONTRADO EN EL SISTEMA");
        return;
      }

      const ahora = new Date();
      const ultimoLatido = codeData.last_ping ? new Date(codeData.last_ping) : null;
      
      if (codeData.current_device_id && codeData.current_device_id !== deviceId && ultimoLatido && (ahora.getTime() - ultimoLatido.getTime()) < 180000) {
        toast.error("⚠️ CÓDIGO EN USO EN OTRO DISPOSITIVO");
        return;
      }

      await supabase.from('access_codes').update({ 
        current_device_id: deviceId,
        last_ping: ahora.toISOString()
      }).eq('code', cleanCode);

      localStorage.setItem('session_access_code', cleanCode);
      setUserRole(role);
      setIsLoggedIn(true);
      toast.success("ACCESO CONCEDIDO.");

    } catch (err) {
      toast.error("ERROR DE CONEXIÓN");
    }
  };

  const handleLogout = async () => {
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
          // Chequeamos si es una agencia
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
    <Dashboard 
      userRole={userRole} 
      onLogout={handleLogout} 
      tenantAgency={tenantAgency} // Pasamos la agencia bloqueada por URL
    />
  ) : (
    <LoginScreen onLogin={handleLogin} />
  );
};

export default Index;
