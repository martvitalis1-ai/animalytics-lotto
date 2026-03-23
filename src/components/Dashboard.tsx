import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, FileText, Grid3X3, PlayCircle, Settings, LogOut, Send } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { ExplosiveData } from "./ExplosiveData";
import { AdminPanelMaestro } from "./AdminPanelMaestro"; // 🛡️ AHORA SÍ EXISTE
import { ModuloJugadas } from "./ModuloJugadas"; 
import { SportsView } from "./SportsView";
import { GuiaUso } from "./GuiaUso";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-8 border-emerald-500 px-4 py-4 shadow-2xl flex justify-between items-center">
        <h1 className="font-black text-2xl italic tracking-tighter text-emerald-400 uppercase">ANIMALYTICS PRO</h1>
        <div className="flex items-center gap-4">
          <a href="https://t.me/" target="_blank" className="bg-sky-500 p-2 rounded-full text-white shadow-lg"><Send size={18} /></a>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={22} /></Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-slate-100 border-b-2 border-slate-900 p-4 sticky top-[85px] z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="bg-white border-4 border-slate-900 rounded-2xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-64 h-12 border-none font-black uppercase text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-2 border-slate-900">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold uppercase text-xs">
                      <div className="flex items-center gap-2"><img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsList className="bg-white p-1 rounded-full h-16 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex overflow-x-auto no-scrollbar w-full md:w-auto">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[11px] uppercase transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-orange-500 data-[state=active]:text-white">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">Deportes</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-slate-900 data-[state=active]:text-white">Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Guía</TabsTrigger>
              <TabsTrigger value="agencias" className="rounded-full px-6 font-black text-[11px] uppercase data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Agencias</TabsTrigger>
              {isMaster && <TabsTrigger value="admin" className="rounded-full px-4 bg-slate-900 text-white ml-2"><Settings size={14}/></TabsTrigger>}
            </TabsList>
          </div>
        </div>

        <div className="p-4 max-w-7xl mx-auto pb-20">
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo" className="mt-0"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="deportes" className="mt-0"><SportsView /></TabsContent>
          <TabsContent value="resultados" className="mt-0"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12">
            <FrequencyHeatmap lotteryId={globalLottery} />
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          <TabsContent value="guia" className="mt-0"><GuiaUso /></TabsContent>
          <TabsContent value="agencias" className="mt-0"><ModuloJugadas tenantAgency={tenantAgency} /></TabsContent>
          {isMaster && <TabsContent value="admin" className="mt-0"><AdminPanelMaestro /></TabsContent>}
        </div>
      </Tabs>
    </div>
  );
}
