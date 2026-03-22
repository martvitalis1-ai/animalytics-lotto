import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, Settings, LogOut, ShieldCheck, Zap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
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
  const isMasterAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased">
      {/* HEADER DE ALTO CONTRASTE */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-2xl italic tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
            <span className="hidden md:block bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">System Operational</span>
          </div>

          <div className="flex items-center gap-4">
            <Select value={globalLottery} onValueChange={setGlobalLottery}>
              <SelectTrigger className="w-48 h-10 rounded-xl font-black uppercase text-[10px] bg-white text-slate-900 border-none ring-offset-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-slate-900 shadow-2xl">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 hover:text-white rounded-full"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* NAVEGACIÓN COMPLETA (8 SECCIONES) */}
          <div className="flex justify-center overflow-x-auto no-scrollbar py-2">
            <TabsList className="bg-slate-900/5 p-1 rounded-full h-14 bunker-border bg-white flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Brain size={14}/> IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Flame size={14}/> Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[11px] uppercase gap-2"><Trophy size={14}/> Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-6 font-black text-[11px] uppercase gap-2"><Dices size={14}/> Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[11px] uppercase gap-2"><FileText size={14}/> Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[11px] uppercase gap-2"><Grid3X3 size={14}/> Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2"><PlayCircle size={14}/> Guía</TabsTrigger>
              <TabsTrigger value="admin" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 bg-slate-900 text-white data-[state=active]:bg-emerald-500"><Settings size={14}/> Admin</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="space-y-10"><FrequencyHeatmap lotteryId={globalLottery} /><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="admin"><div className="p-20 text-center font-black uppercase bunker-border bg-white rounded-[3rem]">Panel de Administración Blindado</div></TabsContent>
          <TabsContent value="deportes"><div className="p-20 text-center font-black uppercase bunker-border bg-white rounded-[3rem]">Sincronizando Data Deportiva...</div></TabsContent>
          <TabsContent value="ruleta"><div className="p-20 text-center font-black uppercase bunker-border bg-white rounded-[3rem]">Analítica de Ruleta Activa</div></TabsContent>
          <TabsContent value="guia"><div className="p-20 text-center font-black uppercase bunker-border bg-white rounded-[3rem]">Guía de Operación del Búnker</div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
