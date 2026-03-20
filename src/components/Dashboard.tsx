import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Brain, Flame, Dices, FileText, ShoppingCart, LogOut, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { DataMapDisplay } from "./DataMapDisplay";
import { ResultsPanel } from "./ResultsPanel";
import { ModuloJugadas } from "./ModuloJugadas";
import { AdminAgencias } from "./AdminAgencias";
import { ThemeToggle } from "./ThemeToggle";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);
  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  // --- REPARACIÓN BLINDADA: ELIMINA EL ERROR 'COUNT' DE LA CONSOLA ---
  useEffect(() => {
    let isMounted = true;
    const loadCount = async () => {
      try {
        const response = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        
        // Blindaje: Solo asignamos si la respuesta no es nula
        if (isMounted && response && response.count !== null && response.count !== undefined) {
          setTotalResults(response.count);
        }
      } catch (e) {
        console.warn("Conexión con Supabase lenta o bloqueada temporalmente.");
        if (isMounted) setTotalResults(0);
      }
    };
    loadCount();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <div className="flex flex-col">
            <h1 className="font-black text-lg uppercase italic leading-none">
              {tenantAgency?.nombre || "ANIMALYTICS PRO"}
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
              {totalResults.toLocaleString()}+ SORTEOS REGISTRADOS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {isMasterAdmin ? '👑 ADMIN' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout} title="Cerrar Sesión">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 justify-center rounded-2xl">
            <TabsTrigger value="ia" className="font-bold gap-2">
              <Brain size={16} /> IA
            </TabsTrigger>
            <TabsTrigger value="explosivo" className="font-bold gap-2">
              <Flame size={16} /> EXPLOSIVO
            </TabsTrigger>
            <TabsTrigger value="ruleta" className="font-bold gap-2">
              <Dices size={16} /> RULETA
            </TabsTrigger>
            <TabsTrigger value="resultados" className="font-bold gap-2">
              <FileText size={16} /> RESULTADOS
            </TabsTrigger>
            <TabsTrigger value="jugadas" className="font-bold gap-2">
              <ShoppingCart size={16} /> AGENCIAS
            </TabsTrigger>
            {(isMasterAdmin || isAgencyManager) && (
              <TabsTrigger value="admin" className="font-bold gap-2">
                <Settings size={16} />
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="ia" className="space-y-6">
            <HourlyPredictionView />
            <AIPredictive />
          </TabsContent>

          <TabsContent value="explosivo" className="space-y-6">
            <DatoRicardoSection agencyId={tenantAgency?.id} />
            <FrequencyHeatmap />
          </TabsContent>

          <TabsContent value="ruleta" className="space-y-6">
            <UniversalRoulette />
            <DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} />
          </TabsContent>

          <TabsContent value="resultados">
            <ResultsPanel isAdmin={isMasterAdmin} />
          </TabsContent>

          <TabsContent value="jugadas">
            <ModuloJugadas forcedAgency={tenantAgency} />
          </TabsContent>

          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? (
              <AdminAgencias />
            ) : (
              <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
