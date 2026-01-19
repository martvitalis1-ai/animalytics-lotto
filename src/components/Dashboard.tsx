import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  Brain, 
  CheckSquare,
  Grid3X3,
  LogOut,
  FileText,
  Flame,
  Dices
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { HISTORY_BATCH } from "@/data/historyBatch";
import { getAnimalFromNumber } from "@/lib/constants";
import { AdminCodeModal } from "./AdminCodeModal";
import { TodayResults } from "./TodayResults";
import { ResultsInsert } from "./ResultsInsert";
import { ResultsPanel } from "./ResultsPanel";
import { HistoryManager } from "./HistoryManager";
import { AdminUserManagement } from "./AdminUserManagement";
import { Verification } from "./Verification";
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
import { HourlyPredictionView } from "./HourlyPredictionView";
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
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos históricos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      const { count } = await supabase
        .from('lottery_results')
        .select('*', { count: 'exact', head: true });
      
      if (count === 0 || count === null) {
        toast.info("Cargando datos históricos...");
        
        for (const item of HISTORY_BATCH) {
          const animalName = getAnimalFromNumber(item.n, item.l);
          await supabase.from('lottery_results').insert({
            lottery_type: item.l,
            result_number: item.n.padStart(2, '0'),
            animal_name: animalName || null,
            draw_time: item.t,
            draw_date: item.d,
          });
        }
        
        toast.success("Datos históricos cargados");
      }
      setDataLoaded(true);
    };
    
    loadInitialData();
  }, []);

  const handleTabChange = (tab: string) => {
    // Tabs que requieren verificación de admin
    if (tab === 'admin' || tab === 'insertar') {
      if (userRole !== 'admin') {
        setPendingTab(tab);
        if (tab === 'admin') {
          setShowAdminModal(true);
        } else {
          setShowInsertModal(true);
        }
        return;
      }
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoAnimalytics} alt="Animalytics" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-black text-lg leading-none">ANIMALYTICS PRO</h1>
                <p className="text-xs text-muted-foreground">Sistema de Inteligencia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <ExportTools type="results" filename="resultados" />
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                userRole === 'admin' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {userRole === 'admin' ? '👑 Admin' : 'Usuario'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            {/* IA Predictiva primero */}
            <TabsTrigger value="ia" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">IA Predictiva</span>
            </TabsTrigger>
            <TabsTrigger value="explosivo" className="flex items-center gap-1.5 data-[state=active]:bg-red-500 data-[state=active]:text-white active:scale-95 transition-transform">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Explosivo</span>
            </TabsTrigger>
            <TabsTrigger value="ruleta" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">Ruleta</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="verificacion" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <CheckSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Verificación</span>
            </TabsTrigger>
            <TabsTrigger value="matriz" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Matriz</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insertar" 
              className="flex items-center gap-1.5 bg-foreground text-background data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-foreground/90 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Insertar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="flex items-center gap-1.5 bg-foreground text-background data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-foreground/90 active:scale-95 transition-transform"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          {/* IA Predictiva - ahora es el tab por defecto */}
          <TabsContent value="ia" className="mt-4 space-y-6">
            <QuickPrediction />
            <HourlyPredictionView />
            <TrendAnalysis />
            <AIPredictive />
          </TabsContent>

          {/* Datos Explosivos + Ruleta */}
          <TabsContent value="explosivo" className="mt-4 space-y-6">
            <ExplosiveData />
            <FrequencyHeatmap />
          </TabsContent>

          {/* Ruleta Universal */}
          <TabsContent value="ruleta" className="mt-4 space-y-6">
            <UniversalRoulette />
            <HourlyPredictionView />
          </TabsContent>

          <TabsContent value="resultados" className="mt-4">
            <ResultsPanel isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="verificacion" className="mt-4">
            <Verification />
          </TabsContent>

          <TabsContent value="matriz" className="mt-4 space-y-6">
            <HourlyMatrix />
            <FrequencyHeatmap />
          </TabsContent>

          <TabsContent value="insertar" className="mt-4">
            <div className="max-w-xl mx-auto space-y-4">
              <ResultsInsert onInserted={() => toast.success("Resultado guardado en la base de datos")} />
              <TodayResults />
            </div>
          </TabsContent>

          <TabsContent value="admin" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <AdminUserManagement />
              <HistoryManager />
            </div>
            <DatoRicardo />
          </TabsContent>
        </Tabs>
      </main>

      {/* Admin Code Modals */}
      <AdminCodeModal
        open={showAdminModal}
        onClose={() => {
          setShowAdminModal(false);
          setPendingTab(null);
        }}
        onSuccess={handleAdminVerified}
        title="Acceso a Administrador"
      />
      
      <AdminCodeModal
        open={showInsertModal}
        onClose={() => {
          setShowInsertModal(false);
          setPendingTab(null);
        }}
        onSuccess={handleAdminVerified}
        title="Acceso a Insertar Resultados"
      />

      {/* Bot Ricardo Flotante */}
      <RicardoBot />
    </div>
  );
}
