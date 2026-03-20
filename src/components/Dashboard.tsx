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
import { ResultsPanel } from "./ResultsPanel";
import { ModuloJugadas } from "./ModuloJugadas";
import { AdminAgencias } from "./AdminAgencias";
import { ThemeToggle } from "./ThemeToggle";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
        // EL BLINDAJE: Si 'response' es null o da error, usamos 0 y la App NO SE CAE
        const total = response?.count ?? 0;
        setTotalResults(Number(total));
      } catch (e) {
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
            <h1 className="font-black text-lg uppercase italic leading-none">{tenantAgency?.nombre || "ANIMALYTICS PRO"}</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">{totalResults.toLocaleString()}+ SORTEOS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {userRole === 'admin' ? '👑 ADMIN' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut size={18} /></Button>
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
          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><DatoRicardoSection agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={userRole === 'admin'} /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
