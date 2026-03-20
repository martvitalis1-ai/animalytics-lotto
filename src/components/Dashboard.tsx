import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send, ShoppingCart, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminCodeModal } from "./AdminCodeModal";
import { TodayResults } from "./TodayResults";
import { ResultsInsert } from "./ResultsInsert";
import { ResultsPanel } from "./ResultsPanel";
import { HistoryManager } from "./HistoryManager";
import { AdminUserManagement } from "./AdminUserManagement";
import { HourlyMatrix } from "./HourlyMatrix";
import { AIPredictive } from "./AIPredictive";
import { DatoRicardo } from "./DatoRicardo";
import { RicardoBot } from "./RicardoBot";
import { TrendAnalysis } from "./TrendAnalysis";
import { NotificationCenter } from "./NotificationCenter";
import { QuickPrediction } from "./QuickPrediction";
import { ExplosiveData } from "./ExplosiveData";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { ThemeToggle } from "./ThemeToggle";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { HypothesisAudit } from "./HypothesisAudit";
import { AdminImageUpload } from "./AdminImageUpload";
import { DataMapDisplay } from "./DataMapDisplay";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { SportsAnalytics } from "./SportsAnalytics";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { AdminManualOverrides } from "./AdminManualOverrides";
import { GuiaUso } from "./GuiaUso";
import { AdminAgencias } from "./AdminAgencias";
import { ModuloJugadas } from "./ModuloJugadas";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);
  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        if (!error && count !== null) setTotalResults(count);
      } catch (e) { console.error("Error síncrono:", e); }
    };
    loadCount();
  }, []);

  return (
    <div className="min-h-screen bg-background text-left text-slate-900">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10" />
            <h1 className="font-black text-lg uppercase italic">{tenantAgency ? tenantAgency.nombre : "ANIMALYTICS PRO"}</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAgencyManager && (
              <Button variant="outline" size="sm" onClick={() => setActiveTab("admin")} className="font-black text-[10px] uppercase gap-2 border-emerald-500/20">
                <Settings className="w-4 h-4" /> <span>MI BANCA</span>
              </Button>
            )}
            <ThemeToggle />
            <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
              {isMasterAdmin ? '👑 MASTER' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50 justify-center">
            <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-1.5" />IA</TabsTrigger>
            <TabsTrigger value="explosivo"><Flame className="w-4 h-4 mr-1.5" />Explosivo</TabsTrigger>
            <TabsTrigger value="deportes"><Trophy className="w-4 h-4 mr-1.5" />Deportes</TabsTrigger>
            <TabsTrigger value="ruleta"><Dices className="w-4 h-4 mr-1.5" />Ruleta</TabsTrigger>
            <TabsTrigger value="resultados"><FileText className="w-4 h-4 mr-1.5" />Resultados</TabsTrigger>
            <TabsTrigger value="matriz"><Grid3X3 className="w-4 h-4 mr-1.5" />Matriz</TabsTrigger>
            <TabsTrigger value="jugadas" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"><ShoppingCart className="w-4 h-4 mr-1.5" />Agencias</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="insertar" className="bg-foreground text-background"><Plus className="w-4 h-4" /></TabsTrigger>}
            {(isMasterAdmin || isAgencyManager) && <TabsTrigger value="admin" className="bg-foreground text-background"><Settings className="w-4 h-4" /></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><QuickPrediction /><TrendAnalysis /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><ExplosiveData /><DatoRicardoSection customName={tenantAgency?.nombre_dato_personalizado} agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="deportes"><SportsAnalytics /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="matriz" className="space-y-6"><SequenceMatrixView /><HourlyMatrix /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="insertar" className="space-y-4"><ResultsInsert onInserted={() => {}} /><TodayResults /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? (
              <><AdminAgencias /><div className="grid gap-4 lg:grid-cols-2"><AdminUserManagement /><AdminImageUpload /></div><AdminManualOverrides /><DatoRicardo /><HistoryManager /><HypothesisAudit /></>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3"><ShieldAlert className="text-amber-600" /><p className="text-xs font-bold text-amber-700 uppercase">GESTIÓN DE BANCA ALQUILADA</p></div>
                <Card className="p-6 bg-white rounded-[2rem] shadow-xl border-none"><h3 className="font-black uppercase italic mb-4 flex items-center gap-2"><Plus className="text-emerald-600" /> Publicar Mi Dato</h3><DatoRicardo agencyContextId={localStorage.getItem('agency_owner_id')} /></Card>
                <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <RicardoBot />
    </div>
  );
}
