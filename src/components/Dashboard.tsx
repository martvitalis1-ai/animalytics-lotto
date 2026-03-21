import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, Flame, TrendingUp, History, Settings, PlayCircle } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { ResultsPanel } from "./ResultsPanel";
import { ResultsInsert } from "./ResultsInsert";
import { ExplosiveData } from "./ExplosiveData";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { UniversalRoulette } from "./UniversalRoulette";

export function Dashboard({ userRole, onLogout }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const isMasterAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="font-black text-lg italic uppercase tracking-tighter text-primary">ANIMALYTICS</h1>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[170px] h-8 font-bold text-xs border-slate-200 rounded-full bg-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2 font-bold">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-full hover:bg-red-50 hover:text-red-600">
          <LogOut size={18} />
        </Button>
      </header>

      <main className="p-4 container mx-auto max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-slate-50 p-1 justify-center rounded-2xl border border-slate-100">
            <TabsTrigger value="ia" className="rounded-xl font-bold text-xs"><TrendingUp size={14} className="mr-1"/> ANÁLISIS</TabsTrigger>
            <TabsTrigger value="matriz" className="rounded-xl font-bold text-xs"><LayoutGrid size={14} className="mr-1"/> MATRIZ</TabsTrigger>
            <TabsTrigger value="explosivo" className="rounded-xl font-bold text-xs"><Flame size={14} className="mr-1"/> EXPLOSIVOS</TabsTrigger>
            <TabsTrigger value="ruleta" className="rounded-xl font-bold text-xs"><PlayCircle size={14} className="mr-1"/> RULETA</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-xl font-bold text-xs"><History size={14} className="mr-1"/> RESULTADOS</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="insertar" className="rounded-xl font-bold text-xs bg-primary/10">+</TabsTrigger>}
            {isMasterAdmin && <TabsTrigger value="admin" className="rounded-xl font-bold text-xs"><Settings size={14}/></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-8">
            <HourlyPredictionView lotteryId={selectedLottery} />
            <AIPredictive />
          </TabsContent>

          <TabsContent value="matriz">
            <SequenceMatrixView />
          </TabsContent>

          <TabsContent value="explosivo">
            <ExplosiveData lotteryId={selectedLottery} />
          </TabsContent>

          <TabsContent value="ruleta"><UniversalRoulette /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel isAdmin={isMasterAdmin} /></TabsContent>
          {isMasterAdmin && <TabsContent value="insertar"><ResultsInsert onInserted={() => {}} /></TabsContent>}
        </Tabs>
      </main>
    </div>
  );
}
