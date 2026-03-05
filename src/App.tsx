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

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const accessCode = localStorage.getItem('session_access_code');
    const deviceId = localStorage.getItem('animalytics_device_fingerprint');

    if (!accessCode || !deviceId) return;

    // Función de Latido (Ping) para mantener sesión y expulsar intrusos
    const runHeartbeat = async () => {
      const { data, error } = await supabase
        .from('access_codes')
        .select('current_device_id')
        .eq('code', accessCode)
        .single();

      if (data) {
        if (data.current_device_id !== deviceId) {
          // Si el ID de dispositivo en DB es diferente al mío, alguien más entró
          localStorage.removeItem('session_access_code');
          toast.error("Sesión cerrada: El código se inició en otro dispositivo.");
          setTimeout(() => window.location.href = "/", 1500);
        } else {
          // Si soy yo, actualizo mi hora de actividad
          await supabase
            .from('access_codes')
            .update({ last_ping: new Date().toISOString() })
            .eq('code', accessCode);
        }
      }
    };

    const interval = setInterval(runHeartbeat, 60000); // Cada 1 minuto
    runHeartbeat(); // Ejecutar al cargar

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
            <Route path="/sports" element={<SportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
