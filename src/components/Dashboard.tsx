import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Brain, Grid3X3, LogOut, FileText, Flame, Dices, Trophy, PlayCircle, Send, ShoppingCart } from "lucide-react";
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
import { ModuloJugadas } from "./ModuloJugadas";
import { AdminAgencias } from "./AdminAgencias";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout }: { userRole: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count } = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
      if (count) setTotalResults(count);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-left">
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logoAnimalytics} alt="Logo" className="h-10" />
          <h1 className="font-black text-lg uppercase italic">ANIMALYTICS PRO</h1>
        </div>
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-muted/50">
            <TabsTrigger value="ia"><Brain className="w-4 h-4 mr-1" />IA</TabsTrigger>
            <TabsTrigger value="matriz"><Grid3X3 className="w-4 h-4 mr-1" />Matriz</TabsTrigger>
            <TabsTrigger value="jugadas"><ShoppingCart className="w-4 h-4 mr-1" />Agencias</TabsTrigger>
            <TabsTrigger value="guia"><PlayCircle className="w-4 h-4 mr-1" />Guía</TabsTrigger>
            {userRole === 'admin' && <TabsTrigger value="admin"><Settings className="w-4 h-4 mr-1" />Admin</TabsTrigger>}
          </TabsList>
          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><QuickPrediction /><TrendAnalysis /><AIPredictive /></TabsContent>
          <TabsContent value="matriz"><SequenceMatrixView /></TabsContent>
          <TabsContent value="jugadas"><ModuloJugadas /></TabsContent>
          <TabsContent value="guia"><GuiaUso /></TabsContent>
          <TabsContent value="admin" className="space-y-4">
            <AdminAgencias />
            <AdminUserManagement />
            <AdminImageUpload />
          </TabsContent>
        </Tabs>
      </main>
      <RicardoBot />
    </div>
  );
}
