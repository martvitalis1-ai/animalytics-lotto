import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send, ShoppingCart, ShieldAlert } from "lucide-react";
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
import { ResultsInsert } from "./ResultsInsert";
import { TodayResults } from "./TodayResults";
import { ThemeToggle } from "./ThemeToggle";
import { AdminCodeModal } from "./AdminCodeModal";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const isMasterAdmin = userRole === 'admin';
  const isAgencyManager = userRole === 'agency_manager';

  // --- REPARACIÓN BLINDADA: CARGA ÚNICA PARA EVITAR EL ERROR 429 ---
  useEffect(() => {
    let isMounted = true;
    const loadCount = async () => {
      try {
        const response = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        
        if (isMounted && response && response.count !== null && response.count !== undefined) {
          setTotalResults(response.count);
        }
      } catch (e) {
        console.warn("Esperando reconexión de búnker...");
      }
    };
    loadCount();
    return () => { isMounted = false; };
  }, []);

  const handleTabChange = (tab: string) => {
    if (isAgencyManager && tab === 'admin') { setActiveTab(tab); return; }
    if ((tab === 'admin' || tab === 'insertar') && !isMasterAdmin) {
      setPendingTab(tab);
      if (tab === 'admin') setShowAdminModal(true);
      else setShowInsertModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAdminVerified = () => {
    setShowAdminModal(false);
    setShowInsertModal(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="sticky top-0 z-50 bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <div className="hidden sm:block">
            <h1 className="font-black text-lg uppercase italic">{tenantAgency?.nombre || "ANIMALYTICS PRO"}</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold">{totalResults.toLocaleString()}+ sorteos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAgencyManager && (
            <Button variant="outline" size="sm" onClick={() => setActiveTab("admin")} className="font-black text-[10px] uppercase gap-2 border-emerald-500/20">
              <Settings className="w-4 h-4" /> <span>BANCA</span>
            </Button>
          )}
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {isMasterAdmin ? '👑 ADMIN' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 justify-center">
            <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-1.5" /> IA</TabsTrigger>
            <TabsTrigger value="explosivo"><Flame className="w-4 h-4 mr-1.5" /> EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="ruleta"><Dices className="w-4 h-4 mr-1.5" /> RULETA</TabsTrigger>
            <TabsTrigger value="resultados"><FileText className="w-4 h-4 mr-1.5" /> RESULTADOS</TabsTrigger>
            <TabsTrigger value="jugadas"><ShoppingCart className="w-4 h-4 mr-1.5" /> AGENCIAS</TabsTrigger>
            {(isMasterAdmin || isAgencyManager) && <TabsTrigger value="admin"><Settings className="w-4 h-4" /></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><DatoRicardoSection agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? <AdminAgencias /> : <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />}
          </TabsContent>
        </Tabs>
      </main>
      <AdminCodeModal open={showAdminModal} onClose={() => setShowAdminModal(false)} onSuccess={handleAdminVerified} title="Acceso Admin" />
      <AdminCodeModal open={showInsertModal} onClose={() => setShowInsertModal(false)} onSuccess={handleAdminVerified} title="Acceso Maestro" />
    </div>
  );
}
