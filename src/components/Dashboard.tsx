// src/components/Dashboard.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, Plus } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { ResultsInsert } from "./ResultsInsert";
import { AdminAgencias } from "./AdminAgencias";
import { GuiaUso } from "./GuiaUso";
import { Button } from "./ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 bunker-header px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-black text-2xl italic uppercase tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={20} /></Button>
        </div>
      </header>

      {/* Selector Sólido (Fix del video) */}
      <div className="bg-slate-100 border-b-2 border-slate-900 p-3 sticky top-[80px] z-40">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-4">
          <span className="text-[10px] font-black uppercase text-slate-500">Lotería Activa:</span>
          <Select value={globalLottery} onValueChange={setGlobalLottery}>
            <SelectTrigger className="w-64 h-10 bg-white border-2 border-slate-900 font-black rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-2 border-slate-900">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id} className="font-bold">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <main className="p-4 max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex overflow-x-auto no-scrollbar py-2">
            <TabsList className="bg-white p-1 rounded-full h-14 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-5 font-black text-[10px] uppercase data-[state=active]:bg-emerald-500 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-5 font-black text-[10px] uppercase data-[state=active]:bg-orange-500 data-[state=active]:text-white">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-5 font-black text-[10px] uppercase">Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-5 font-black text-[10px] uppercase">Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-5 font-black text-[10px] uppercase">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-5 font-black text-[10px] uppercase">Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-5 font-black text-[10px] uppercase">Guía</TabsTrigger>
              {isMaster && <TabsTrigger value="admin" className="rounded-full px-4 bg-slate-900 text-white ml-2">+</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz"><FrequencyHeatmap lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="guia"><GuiaUso /></TabsContent>
          {isMaster && (
            <TabsContent value="admin" className="grid md:grid-cols-2 gap-8">
              <ResultsInsert /><AdminAgencias />
            </TabsContent>
          )}
          {/* Placeholders para Deportes y Ruleta (Para que no estén vacíos) */}
          <TabsContent value="deportes" className="p-20 text-center bunker-card"><Trophy size={48} className="mx-auto text-slate-200" /><h3 className="font-black italic mt-4 uppercase">Sincronizando Líneas de Las Vegas...</h3></TabsContent>
          <TabsContent value="ruleta" className="p-20 text-center bunker-card"><Dices size={48} className="mx-auto text-slate-200" /><h3 className="font-black italic mt-4 uppercase">Analítica de Ruleta en Proceso...</h3></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
