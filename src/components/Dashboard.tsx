// src/components/Dashboard.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, Settings, Send } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { ExplosiveData } from "./ExplosiveData";
import { GuiaUso } from "./GuiaUso";
import { ResultsInsert } from "./ResultsInsert";
import { AdminAgencias } from "./AdminAgencias";
import { ModuloJugadas } from "./ModuloJugadas"; // RESTAURADO
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-8 border-emerald-500 px-4 py-4 shadow-2xl flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="font-black text-2xl italic tracking-tighter text-emerald-400 uppercase">ANIMALYTICS PRO</h1>
           <a href="https://t.me/" target="_blank" className="bg-sky-500 p-2 rounded-full text-white"><Send size={18} /></a>
        </div>
        <div className="flex items-center gap-2">
          {isMaster && <Button variant="ghost" onClick={() => setActiveTab("admin")} className="text-emerald-400"><Settings size={22} /></Button>}
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={22} /></Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-slate-100 border-b-2 border-slate-900 p-4 sticky top-[85px] z-40 space-y-4">
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

            <TabsList className="bg-white p-1 rounded-full h-14 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex overflow-x-auto no-scrollbar w-full md:w-auto">
              <TabsTrigger value="ia" className="rounded-full px-5 font-black text-[10px] uppercase flex-1">IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-5 font-black text-[10px] uppercase flex-1">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-5 font-black text-[10px] uppercase flex-1 text-orange-500">Deportes</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-5 font-black text-[10px] uppercase flex-1">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-5 font-black text-[10px] uppercase flex-1">Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-5 font-black text-[10px] uppercase flex-1 text-emerald-600">Guía</TabsTrigger>
              <TabsTrigger value="agencias" className="rounded-full px-5 font-black text-[10px] uppercase flex-1 bg-emerald-500 text-white">Agencias</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-4 max-w-7xl mx-auto pb-20">
          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="space-y-12">
            <FrequencyHeatmap lotteryId={globalLottery} />
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          <TabsContent value="guia"><GuiaUso /></TabsContent>
          <TabsContent value="agencias"><ModuloJugadas tenantAgency={tenantAgency} /></TabsContent>
          <TabsContent value="deportes">
             <div className="p-20 text-center border-4 border-slate-900 rounded-[3rem] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Trophy size={60} className="mx-auto text-slate-200" />
                <h3 className="font-black uppercase italic text-2xl mt-4">Líneas de Las Vegas en Sincronización</h3>
             </div>
          </TabsContent>
          {isMaster && (
            <TabsContent value="admin" className="space-y-10">
               <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl"><ResultsInsert /></div>
               <div className="bg-slate-900 text-white border-b-8 border-orange-500 rounded-[3rem] p-8"><AdminAgencias /></div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
