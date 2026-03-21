import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Grid3X3, Settings, LayoutDashboard } from "lucide-react";
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 

export function Dashboard({ userRole, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        
        {/* NAVEGACIÓN TIPO SOFTWARE PROFESIONAL */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1 rounded-full h-12 shadow-sm border border-slate-200">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-xs uppercase tracking-tighter">Analítica</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-xs uppercase tracking-tighter">Explosivos</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-xs uppercase tracking-tighter">Matriz</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-xs uppercase tracking-tighter">Bóveda</TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENIDO DE ANALÍTICA (OPCIÓN 3) */}
          <TabsContent value="ia" className="space-y-6">
            <HourlyPredictionView lotteryId={globalLottery} onLotteryChange={setGlobalLottery} />
          </TabsContent>

          <TabsContent value="matriz">
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          
          <TabsContent value="explosivo">
            <div className="p-20 text-center font-black uppercase text-slate-300">Sección Explosivos en Sincronización...</div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
