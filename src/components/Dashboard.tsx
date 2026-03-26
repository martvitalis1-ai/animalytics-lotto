import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, LogOut, Send } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { SequenceMatrixView } from "./SequenceMatrixView";
import { ExplosiveData } from "./ExplosiveData";
import { SportsView } from "./SportsView";
import { ModuloJugadas } from "./ModuloJugadas"; 
import { AdminPanelMaestro } from "./AdminPanelMaestro";
import { GuiaUso } from "./GuiaUso";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  // 🛡️ MAPEADO DEFINITIVO: Esto hace que Lotto Rey y Granjita funcionen al 100%
  const dbId = globalLottery === 'la_granjita' ? 'granjita' : 
               globalLottery === 'el_guacharo' ? 'guacharo' : 
               globalLottery.toLowerCase().trim();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-x-hidden">
      <header className="sticky top-0 z-[100] bg-slate-900 text-white border-b-4 border-emerald-500 px-6 md:px-10 py-2 md:py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center shrink-0">
             <img src="https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/logo-animalytics.png" className="h-16 md:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] ml-2" alt="Logo" />
             <div className="flex flex-col ml-8">
                <h1 className="font-black text-2xl md:text-5xl italic leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]">
                  <span className="text-emerald-400">ANIMALYTICS</span> <span className="text-white">PRO</span>
                </h1>
                <span className="text-[9px] md:text-[16px] font-black text-emerald-300 uppercase tracking-[0.35em] mt-1.5 drop-shadow-md text-nowrap">Bunker Intelligence</span>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="bg-white rounded-xl border-2 border-emerald-500 shadow-md flex-1 md:flex-none">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-full md:w-[240px] h-10 border-none bg-transparent font-black uppercase text-[10px] md:text-xs text-slate-900 focus:ring-0 px-3">
                  <SelectValue placeholder="Lotería" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} className="border-2 border-slate-900 bg-white shadow-2xl z-[150]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-black text-slate-900 text-[10px] md:text-xs uppercase">{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')} className="bg-[#229ED9] h-10 px-3 rounded-xl shadow-lg border-2 border-white/20 active:scale-95"><Send size={14} /></Button>
            <Button variant="ghost" onClick={onLogout} className="text-white p-1 hover:bg-red-500"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b-2 border-slate-200 sticky top-[72px] md:top-[128px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto p-1">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1">
              {["ia", "explosivo", "deportes", "resultados", "matriz", "guia", "agencias"].map((t) => (
                <TabsTrigger key={t} value={t} className="px-1 py-2 font-black text-[9px] md:text-[10px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent uppercase">{t}</TabsTrigger>
              ))}
              {isMaster && <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500"><Settings size={16}/></TabsTrigger>}
            </TabsList>
          </div>
        </div>
        <div className="p-2 md:p-6 max-w-7xl mx-auto overflow-hidden">
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados" className="mt-0"><ResultsPanel lotteryId={dbId} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12"><FrequencyHeatmap lotteryId={dbId} /><SequenceMatrixView lotteryId={dbId} /></TabsContent>
          <TabsContent value="explosivo" className="mt-0"><ExplosiveData lotteryId={dbId} /></TabsContent>
          <TabsContent value="deportes" className="mt-0"><SportsView /></TabsContent>
          <TabsContent value="guia" className="mt-0"><GuiaUso /></TabsContent>
          <TabsContent value="agencias" className="mt-0"><ModuloJugadas /></TabsContent>
          {isMaster && <TabsContent value="admin" className="mt-0"><AdminPanelMaestro userRole={userRole} /></TabsContent>}
        </div>
      </Tabs>
    </div>
  );
}
