import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased">
      {/* HEADER DE COMANDO */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-black text-xl italic uppercase tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
          
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl p-1 border-2 border-emerald-500 shadow-lg">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-40 h-8 border-none bg-transparent font-black uppercase text-[10px] text-slate-900 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-900 shadow-2xl z-[100]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="p-2 md:p-6 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* NAVEGACIÓN DE 8 SECCIONES COMPLETA */}
          <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar py-2 -mx-2 px-2 sticky top-[75px] z-40">
            <TabsList className="bg-white p-1 rounded-full h-14 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-5 font-black text-[10px] uppercase gap-1 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Brain size={14}/> IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-5 font-black text-[10px] uppercase gap-1 data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Flame size={14}/> Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-5 font-black text-[10px] uppercase gap-1">Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-5 font-black text-[10px] uppercase gap-1">Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-5 font-black text-[10px] uppercase gap-1">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-5 font-black text-[10px] uppercase gap-1">Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-5 font-black text-[10px] uppercase gap-1">Guía</TabsTrigger>
              <TabsTrigger value="agencias" className="rounded-full px-5 font-black text-[10px] uppercase gap-1 bg-emerald-500/10 text-emerald-700">Agencias</TabsTrigger>
              {isMaster && <TabsTrigger value="admin" className="rounded-full px-4 bg-slate-900 text-white ml-2"><Plus size={16}/></TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="space-y-10"><FrequencyHeatmap lotteryId={globalLottery} /><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          
          <TabsContent value="deportes">
            <div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[4rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col items-center">
              <Trophy size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic">Líneas Deportivas en Sincronización</h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Calculando cuotas de Las Vegas...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
