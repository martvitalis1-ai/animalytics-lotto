import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Flame, Dices, FileText, ShoppingCart, LogOut, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { DataMapDisplay } from "./DataMapDisplay";
import { ResultsPanel } from "./ResultsPanel";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { HourlyMatrix } from "./HourlyMatrix";
import { ModuloJugadas } from "./ModuloJugadas";
import { AdminAgencias } from "./AdminAgencias";
import { DatoRicardo } from "./DatoRicardo";
import { ResultsInsert } from "./ResultsInsert";
import { TodayResults } from "./TodayResults";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);
  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  // --- REPARACIÓN ATÓMICA: EVITA EL NULL READING COUNT ---
  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
        if (response && response.count !== null) {
          setTotalResults(response.count);
        }
      } catch (e) {
        setTotalResults(0);
      }
    };
    loadCount();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={logoAnimalytics} alt="Logo" className="h-8" />
          <h1 className="font-black text-sm uppercase italic">{tenantAgency ? tenantAgency.nombre : "ANIMALYTICS PRO"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-primary text-white px-2 py-1 rounded">
            {isMasterAdmin ? '👑 MASTER' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="explosivo">Explosivo</TabsTrigger>
            <TabsTrigger value="ruleta">Ruleta</TabsTrigger>
            <TabsTrigger value="resultados">Resultados</TabsTrigger>
            <TabsTrigger value="matriz">Matriz</TabsTrigger>
            <TabsTrigger value="jugadas">Agencias</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="insertar">+</TabsTrigger>}
            {(isMasterAdmin || isAgencyManager) && <TabsTrigger value="admin"><Settings className="w-4 h-4" /></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><DatoRicardoSection agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="matriz" className="space-y-6"><SequenceMatrixView /><HourlyMatrix /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="insertar"><ResultsInsert onInserted={() => {}} /><TodayResults /></TabsContent>
          <TabsContent value="admin">
            {isMasterAdmin ? <AdminAgencias /> : <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
