import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send, ShoppingCart, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TodayResults } from "./TodayResults";
import { ResultsInsert } from "./ResultsInsert";
import { ResultsPanel } from "./ResultsPanel";
import { HistoryManager } from "./HistoryManager";
import { AdminUserManagement } from "./AdminUserManagement";
import { HourlyMatrix } from "./HourlyMatrix";
import { AIPredictive } from "./AIPredictive";
import { TrendAnalysis } from "./TrendAnalysis";
import { QuickPrediction } from "./QuickPrediction";
import { ExplosiveData } from "./ExplosiveData";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { UniversalRoulette } from "./UniversalRoulette";
import { ThemeToggle } from "./ThemeToggle";
import { DatoRicardoSection } from "./DatoRicardoSection";
import { AdminImageUpload } from "./AdminImageUpload";
import { DataMapDisplay } from "./DataMapDisplay";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { AdminManualOverrides } from "./AdminManualOverrides";
import { GuiaUso } from "./GuiaUso";
import { AdminAgencias } from "./AdminAgencias";
import { ModuloJugadas } from "./ModuloJugadas";
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

  // --- REPARACIÓN BLINDADA: ELIMINA EL ERROR 'COUNT' ---
  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const response = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
        // Verificación de seguridad extrema para no leer de un null
        if (isMounted && response && typeof response.count === 'number') {
          setTotalResults(response.count);
        }
      } catch (e) {
        if (isMounted) setTotalResults(0);
      }
    };
    loadStats();
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <div>
            <h1 className="font-black text-lg uppercase italic leading-none">{tenantAgency ? tenantAgency.nombre : "ANIMALYTICS PRO"}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{totalResults.toLocaleString()}+ SORTEOS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-primary text-white">
            {isMasterAdmin ? '👑 MASTER' : isAgencyManager ? '🏦 BANCA' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-slate-200/50 p-1 justify-center rounded-2xl">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="explosivo">EXPLOSIVO</TabsTrigger>
            <TabsTrigger value="ruleta">RULETA</TabsTrigger>
            <TabsTrigger value="resultados">RESULTADOS</TabsTrigger>
            <TabsTrigger value="jugadas">AGENCIAS</TabsTrigger>
            {(isMasterAdmin || isAgencyManager) && <TabsTrigger value="admin"><Settings size={16}/></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><QuickPrediction /><TrendAnalysis /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><ExplosiveData /><DatoRicardoSection agencyId={tenantAgency?.id} /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay customMap={tenantAgency?.imagen_ruleta_url} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            {isMasterAdmin ? (
              <><AdminAgencias /><div className="grid gap-4 lg:grid-cols-2"><AdminUserManagement /><AdminImageUpload /></div><AdminManualOverrides /><DatoRicardo /><HistoryManager /></>
            ) : (
              <AdminAgencias selfManagedId={localStorage.getItem('agency_owner_id')} />
            )}
          </TabsContent>
        </Tabs>
      </main>
      <AdminCodeModal open={showAdminModal} onClose={() => setShowAdminModal(false)} onSuccess={() => setActiveTab(pendingTab || "ia")} title="Acceso Admin" />
      <AdminCodeModal open={showInsertModal} onClose={() => setShowInsertModal(false)} onSuccess={() => setActiveTab(pendingTab || "ia")} title="Acceso Maestro" />
      <RicardoBot />
    </div>
  );
}
