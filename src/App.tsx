import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SportsPage from "./pages/SportsPage";
import LoginAgencia from "@/pages/LoginAgencia"; 
import PanelAgencia from "@/pages/PanelAgencia";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const accessCode = localStorage.getItem('session_access_code');
    const deviceId = localStorage.getItem('animalytics_device_fingerprint');

    if (!accessCode || !deviceId) return;

    const runHeartbeat = async () => {
      try {
        const { data } = await supabase
          .from('access_codes')
          .select('current_device_id')
          .eq('code', accessCode)
          .maybeSingle();

        if (data && data.current_device_id !== deviceId) {
          localStorage.removeItem('session_access_code');
          toast.error("Sesión cerrada: Abierta en otro dispositivo.");
          setTimeout(() => window.location.href = "/", 1500);
        } else {
          await supabase
            .from('access_codes')
            .update({ last_ping: new Date().toISOString() })
            .eq('code', accessCode);
        }
      } catch (e) { console.error("Heartbeat error"); }
    };

    const interval = setInterval(runHeartbeat, 60000);
    runHeartbeat();
    return () => clearInterval(interval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/acceso-banca" element={<LoginAgencia />} />
            <Route path="/gestion-banca" element={<PanelAgencia />} />
            <Route path="/sports" element={<SportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
