import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Zap, Trophy, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { ResultsPanel } from "./ResultsPanel";
import { ResultsInsert } from "./ResultsInsert";
import { SportsAnalytics } from "./SportsAnalytics";
import { AdminAgencias } from "./AdminAgencias";
import { UniversalRoulette } from "./UniversalRoulette";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [totalResults, setTotalResults] = useState<number>(0);
  const isMasterAdmin = userRole === 'admin';

  useEffect(() => {
    const loadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        // Si el conteo es nulo, ponemos 0 para que no explote la App
        setTotalResults(count ?? 0);
      } catch (e) {
        console.error("Error cargando estadísticas:", e);
        setTotalResults(0);
      }
    };
    loadCount();
  }, []);

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <header className="p-4 border-b flex justify-between items-center bg-white shadow-sm sticky top-0 z-50">
        <div className="flex flex-col">
          <h1 className="font-black text-xl italic uppercase">ANIMALYTICS PRO</h1>
          <span className="text-[10px] font-bold text-muted-foreground">{totalResults.toLocaleString()} SORTEOS REGISTRADOS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-primary text-white px-2 py-1 rounded">
            {isMasterAdmin ? '👑 ADMIN MAESTRO' : 'USUARIO'}
          </span>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut size={18} /></Button>
        </div>
      </header>

      <main className="p-4 container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto bg-muted/50 p-1 justify-center rounded-2xl">
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="deportes">DEPORTES</TabsTrigger>
            <TabsTrigger value="ruleta">RULETA</TabsTrigger>
            <TabsTrigger value="resultados">RESULTADOS</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="insertar" className="bg-primary text-white">+</TabsTrigger>}
            {isMasterAdmin && <TabsTrigger value="admin"><Settings size={16}/></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-6"><HourlyPredictionView /><AIPredictive /></TabsContent>
          <TabsContent value="deportes"><SportsAnalytics /></TabsContent>
          <TabsContent value="ruleta"><UniversalRoulette /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="insertar"><ResultsInsert onInserted={() => {}} /></TabsContent>
          <TabsContent value="admin"><AdminAgencias /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
