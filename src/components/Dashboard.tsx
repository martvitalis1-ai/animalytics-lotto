import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send } from "lucide-react";
import { toast } from "sonner";
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
import { ExportTools } from "./ExportTools";
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
import { useNavigate } from "react-router-dom";
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

export function Dashboard({ userRole, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ia");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar contador
        const { count } = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
        if (count) setTotalResults(count);

        // Cargar link de Telegram
        const { data: guiaData } = await supabase.from('manual_guia').select('telegram_url').limit(1).maybeSingle();
        if (guiaData?.telegram_url) setTelegramUrl(guiaData.telegram_url);
      } catch (e) {
        console.error("Error cargando Dashboard", e);
      }
    };
    loadInitialData();
  }, []);

  const handleTabChange = (tab: string) => {
    if ((tab === 'admin' || tab === 'insertar') && userRole !== 'admin') {
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border text-left">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block">
              <h1 className="font-black text-lg leading-none uppercase italic">ANIMALYTICS PRO</h1>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{totalResults.toLocaleString()}+ sorteos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* BOTÓN TELEGRAM PC */}
            {telegramUrl && (
              <Button 
                onClick={() => window.open(telegramUrl, '_blank')}
                className="hidden lg:flex h-9 bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white font-black text-[10px] uppercase italic gap-2 shadow-lg rounded-full px-4"
              >
                <Send className="w-3.5 h-3.5 fill-white" /> Telegram
              </Button>
            )}
            <ThemeToggle />
            <NotificationCenter />
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${userRole === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {userRole === 'admin' ? '👑 Admin' : 'Usuario'}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        {/* BOTÓN TELEGRAM MÓVIL */}
        {telegramUrl && (
          <div className="lg:hidden mb-4">
            <Button 
              onClick={() => window.open(telegramUrl, '_blank')}
              className="w-full h-12 bg-[#24A1DE] text-white font-black text-sm uppercase italic gap-2 rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              <Send className="w-5 h-5 fill-white" /> Unirse al Telegram Oficial
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-1.5" />IA</TabsTrigger>
            <TabsTrigger value="explosivo"><Flame className="w-4 h-4 mr-1.5" />Explosivo</TabsTrigger>
            <TabsTrigger value="deportes"><Trophy className="w-4 h-4 mr-1.5" />Deportes</TabsTrigger>
            <TabsTrigger value="ruleta"><Dices className="w-4 h-4 mr-1.5" />Ruleta</TabsTrigger>
            <TabsTrigger value="resultados"><FileText className="w-4 h-4 mr-1.5" />Resultados</TabsTrigger>
            <TabsTrigger value="matriz"><Grid3X3 className="w-4 h-4 mr-1.5" />Matriz</TabsTrigger>
            <TabsTrigger value="guia" className="bg-primary/10 text-primary border border-primary/20"><PlayCircle className="w-4 h-4 mr-1.5" />Guía</TabsTrigger>
            <TabsTrigger value="insertar" className="bg-foreground text-background"><Plus className="w-4 h-4" /></TabsTrigger>
            <TabsTrigger value="admin" className="bg-foreground text-background"><Settings className="w-4 h-4" /></TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><QuickPrediction /><TrendAnalysis /><AIPredictive /></TabsContent>
          <TabsContent value="explosivo" className="space-y-6"><ExplosiveData /><DatoRicardoSection /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="deportes"><SportsAnalytics /></TabsContent>
          <TabsContent value="ruleta" className="space-y-6"><UniversalRoulette /><DataMapDisplay /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={userRole === 'admin'} /></TabsContent>
          <TabsContent value="matriz" className="space-y-6"><SequenceMatrixView /><HourlyMatrix /><FrequencyHeatmap /></TabsContent>
          <TabsContent value="guia"><GuiaUso /></TabsContent>
          <TabsContent value="insertar" className="max-w-xl mx-auto space-y-4"><ResultsInsert onInserted={() => {}} /><TodayResults /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2"><AdminUserManagement /><AdminImageUpload /></div>
            <AdminManualOverrides /><DatoRicardo /><HistoryManager /><HypothesisAudit />
          </TabsContent>
        </Tabs>
      </main>

      <AdminCodeModal open={showAdminModal} onClose={() => setShowAdminModal(false)} onSuccess={handleAdminVerified} title="Acceso Admin" />
      <AdminCodeModal open={showInsertModal} onClose={() => setShowInsertModal(false)} onSuccess={handleAdminVerified} title="Acceso Insertar" />
      <RicardoBot />
    </div>
  );
}
