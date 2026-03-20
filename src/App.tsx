import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SportsPage from "./pages/SportsPage";
import LoginAgencia from "./pages/LoginAgencia";
import PanelAgencia from "./pages/PanelAgencia";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppErrorBoundary title="La aplicación encontró un error">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/acceso-banca" element={<LoginAgencia />} />
              <Route path="/gestion-banca" element={<PanelAgencia />} />
              <Route path="/sports" element={<SportsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
