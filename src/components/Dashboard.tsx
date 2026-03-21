import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { ResultsPanel } from "./ResultsPanel";
import { ModuloJugadas } from "./ModuloJugadas";
import { ThemeToggle } from "./ThemeToggle";
import { AppErrorBoundary } from "./AppErrorBoundary";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = (await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true })) || { count: 0 };

        setTotalResults(Number(response?.count ?? 0));
      } catch (error) {
        console.error('Dashboard count load failed:', error);
        setTotalResults(0);
      }
    };

    loadCount();
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <div className="flex flex-col text-left">
            <h1 className="font-black text-lg uppercase italic leading-none">
              {tenantAgency?.nombre || "ANIMALYTICS PRO"}
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
              {totalResults.toLocaleString()}+ SORTEOS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {userRole === 'admin' ? '👑 ADMIN' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 justify-center rounded-2xl">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="explosivo">EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="ruleta">RULETA</TabsTrigger>
            <TabsTrigger value="resultados">RESULTADOS</TabsTrigger>
            <TabsTrigger value="jugadas">AGENCIAS</TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-6">
            <AppErrorBoundary title="Falló la predicción horaria">
              <HourlyPredictionView />
            </AppErrorBoundary>
            <AppErrorBoundary title="Falló la IA predictiva">
              <AIPredictive />
            </AppErrorBoundary>
          </TabsContent>

          <TabsContent value="explosivo" className="space-y-6">
            <AppErrorBoundary title="Falló Dato Ricardo">
              <DatoRicardoSection agencyId={tenantAgency?.id} />
            </AppErrorBoundary>
            <AppErrorBoundary title="Falló el mapa de frecuencias">
              <FrequencyHeatmap />
            </AppErrorBoundary>
          </TabsContent>

          <TabsContent value="ruleta" className="space-y-6">
            <AppErrorBoundary title="Falló la ruleta">
              <UniversalRoulette />
            </AppErrorBoundary>
          </TabsContent>

          <TabsContent value="resultados">
            <AppErrorBoundary title="Falló el panel de resultados">
              <ResultsPanel isAdmin={userRole === 'admin'} />
            </AppErrorBoundary>
          </TabsContent>

          <TabsContent value="jugadas">
            <AppErrorBoundary title="Falló el módulo de agencias">
              <ModuloJugadas forcedAgency={tenantAgency} />
            </AppErrorBoundary>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
