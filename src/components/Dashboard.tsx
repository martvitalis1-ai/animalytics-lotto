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
    // Reemplaza el bloque de la imagen por este:
<div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-50 overflow-hidden">
  <img 
    key={nextPrediction.topPick.code}
    src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${nextPrediction.topPick.code === '0' || nextPrediction.topPick.code === '00' ? nextPrediction.topPick.code : nextPrediction.topPick.code.padStart(2, '0')}.png`} 
    className="w-full h-full object-contain z-10 drop-shadow-2xl animate-in zoom-in-95 duration-500" 
    crossOrigin="anonymous"
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
  />
  <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none select-none">
    {nextPrediction.topPick.code.padStart(2, '0')}
  </span>
</div>
