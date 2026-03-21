import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutGrid, Flame, TrendingUp, History, Settings, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HourlyPredictionView } from "./HourlyPredictionView";
import { AIPredictive } from "./AIPredictive";
import { ResultsPanel } from "./ResultsPanel";
import { ResultsInsert } from "./ResultsInsert";
import { ExplosiveData } from "./ExplosiveData";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { UniversalRoulette } from "./UniversalRoulette";

const LOTTERIES = [
  { id: 'lotto_activo', name: 'Lotto Activo' },
  { id: 'la_granjita', name: 'La Granjita' },
  { id: 'guacharo_activo', name: 'Guácharo Activo' },
  { id: 'guacharito', name: 'Guacharito' }
];

export function Dashboard({ userRole, onLogout }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const isMasterAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HEADER PROFESIONAL */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="font-black text-xl italic uppercase tracking-tighter">ANIMALYTICS PRO</h1>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[180px] h-8 font-bold border-2 border-primary/20 rounded-full bg-slate-50">
              <SelectValue placeholder="Lotería" />
            </SelectTrigger>
            <SelectContent>
              {LOTTERIES.map(l => <SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout} className="rounded-full hover:bg-red-50 hover:text-red-600">
          <LogOut size={20} />
        </Button>
      </header>

      <main className="p-4 container mx-auto max-w-5xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto bg-slate-100/50 p-1 justify-center rounded-3xl border border-slate-200">
            <TabsTrigger value="ia" className="rounded-2xl font-bold"><TrendingUp size={16} className="mr-1"/> IA</TabsTrigger>
            <TabsTrigger value="matriz" className="rounded-2xl font-bold"><LayoutGrid size={16} className="mr-1"/> MATRIZ</TabsTrigger>
            <TabsTrigger value="explosivo" className="rounded-2xl font-bold"><Flame size={16} className="mr-1"/> EXPLOSIVOS</TabsTrigger>
            <TabsTrigger value="ruleta" className="rounded-2xl font-bold"><PlayCircle size={16} className="mr-1"/> RULETA</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-2xl font-bold"><History size={16} className="mr-1"/> RESULTADOS</TabsTrigger>
            {isMasterAdmin && <TabsTrigger value="insertar" className="bg-primary text-white rounded-2xl">+</TabsTrigger>}
            {isMasterAdmin && <TabsTrigger value="admin" className="rounded-2xl"><Settings size={16}/></TabsTrigger>}
          </TabsList>

          <TabsContent value="ia" className="space-y-8">
            <HourlyPredictionView lotteryId={selectedLottery} />
            <AIPredictive lotteryId={selectedLottery} />
          </TabsContent>

          <TabsContent value="matriz">
            <SequenceMatrixView lotteryId={selectedLottery} />
          </TabsContent>

          <TabsContent value="explosivo">
            <ExplosiveData lotteryId={selectedLottery} />
          </TabsContent>

          <TabsContent value="ruleta"><UniversalRoulette /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={selectedLottery} isAdmin={isMasterAdmin} /></TabsContent>
          <TabsContent value="insertar"><ResultsInsert onInserted={() => {}} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
