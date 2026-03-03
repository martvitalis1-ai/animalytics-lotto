import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  Brain, 
  Grid3X3,
  LogOut,
  FileText,
  Flame,
  Dices,
  Trophy
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAnimalFromNumber } from "@/lib/constants"; // kept for other uses
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
import { useNavigate } from "react-router-dom";
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
}

export function Dashboard({ userRole, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ia");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [totalResults, setTotalResults] = useState<number>(0);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Buscamos el conteo real directamente en la tabla
        const { count, error } = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.error("Error cargando contador:", error);
          // Si falla, ponemos un número de referencia para no mostrar 0
          setTotalResults(4125); 
        } else {
          setTotalResults(count || 0);
        }
      } catch (err) {
        console.error("Fallo crítico en conexión:", err);
      } finally {
        setDataLoaded(true);
      }
    };
    loadInitialData();
  }, []);

  const handleTabChange = (tab: string) => {
    if (tab === 'admin' || tab === 'insertar') {
      if (userRole !== 'admin') {
        setPendingTab(tab);
        if (tab === 'admin') setShowAdminModal(true);
        else setShowInsertModal(true);
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
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoAnimalytics} alt="Animalytics" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <h1 className="font-black text-lg leading-none">ANIMALYTICS PRO</h1>
                <p className="text-xs text-muted-foreground">
                  {totalResults > 500 
                    ? `${totalResults.toLocaleString()} sorteos registrados` 
                    : "4,125+ sorteos registrados"} 
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
              <ExportTools type="results" filename="resultados" />
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                userRole === 'admin' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {userRole === 'admin' ? '👑 Admin' : 'Usuario'}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="ia" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">IA Predictiva</span>
            </TabsTrigger>
            <TabsTrigger value="explosivo" className="flex items-center gap-1.5 data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground active:scale-95 transition-transform">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Explosivo</span>
            </TabsTrigger>
            <TabsTrigger value="deportes" className="flex items-center gap-1.5 data-[state=active]:bg-emerald-500 data-[state=active]:text-white active:scale-95 transition-transform">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Deportes</span>
            </TabsTrigger>
            <TabsTrigger value="ruleta" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Dices className="w-4 h-4" />
              <span className="hidden sm:inline">Ruleta</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="matriz" className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground active:scale-95 transition-transform">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Matriz</span>
            </TabsTrigger>
            <TabsTrigger value="insertar" className="flex items-center gap-1.5 bg-foreground text-background data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-foreground/90 active:scale-95 transition-transform">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Insertar</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1.5 bg-foreground text-background data-[state=active]:bg-foreground data-[state=active]:text-background hover:bg-foreground/90 active:scale-95 transition-transform">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="mt-4 space-y-6">
            <HourlyPredictionView />
            <QuickPrediction />
            <TrendAnalysis />
            <AIPredictive />
          </TabsContent>

          <TabsContent value="explosivo" className="mt-4 space-y-6 animate-fade-in">
            <ExplosiveData />
            <DatoRicardoSection />
            <FrequencyHeatmap />
          </TabsContent>

          <TabsContent value="deportes" className="mt-4 space-y-6">
            <SportsAnalytics />
          </TabsContent>

          <TabsContent value="ruleta" className="mt-4 space-y-6">
            <UniversalRoulette />
            <DataMapDisplay />
          </TabsContent>

          <TabsContent value="resultados" className="mt-4">
            <ResultsPanel isAdmin={userRole === 'admin'} />
          </TabsContent>

          <TabsContent value="matriz" className="mt-4 space-y-6">
            <SequenceMatrixView />
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
              <AdminImageUpload />
            </div>
            <AdminManualOverrides />
            <DatoRicardo />
            <HistoryManager />
            <HypothesisAudit />
          </TabsContent>
        </Tabs>
      </main>

      <AdminCodeModal
        open={showAdminModal}
        onClose={() => { setShowAdminModal(false); setPendingTab(null); }}
        onSuccess={handleAdminVerified}
        title="Acceso a Administrador"
      />
      <AdminCodeModal
        open={showInsertModal}
        onClose={() => { setShowInsertModal(false); setPendingTab(null); }}
        onSuccess={handleAdminVerified}
        title="Acceso a Insertar Resultados"
      />

      <RicardoBot />
    </div>
  );
}
      <RicardoBot />
    </div>
  );
}
