import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";

export function Dashboard({ userRole }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white">
      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1 rounded-full h-14 shadow-inner border border-slate-200">
              <TabsTrigger value="ia" className="rounded-full px-8 font-black text-xs uppercase italic">IA Predictiva</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-8 font-black text-xs uppercase italic">Explosivos</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-8 font-black text-xs uppercase italic">Matriz</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-8 font-black text-xs uppercase italic">Bóveda</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} onLotteryChange={setGlobalLottery} /></TabsContent>
          <TabsContent value="matriz"><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={userRole === 'admin'} lotteryId={globalLottery} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
