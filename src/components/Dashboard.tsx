import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, ShieldCheck, Zap } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { FrequencyHeatmap } from "./FrequencyHeatmap"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { Button } from "@/components/ui/button";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* HEADER DE ALTO IMPACTO (Negro, Verde, Naranja) */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-3 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-2xl italic tracking-tighter text-emerald-400">ANIMALYTICS PRO</h1>
            <div className="hidden md:flex gap-2">
              <span className="bg-orange-500 text-slate-900 px-2 py-0.5 rounded text-[8px] font-black uppercase">Live Data</span>
              <span className="bg-emerald-500 text-slate-900 px-2 py-0.5 rounded text-[8px] font-black uppercase">IA Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={globalLottery} onValueChange={setGlobalLottery}>
              <SelectTrigger className="w-48 h-10 rounded-xl font-black uppercase text-[10px] bg-white text-slate-900 border-none">
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
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* NAVEGACIÓN DE 8 SECCIONES (IGUAL A TU FOTO 2) */}
          <div className="flex justify-center overflow-x-auto no-scrollbar py-2">
            <TabsList className="bg-white p-1 rounded-full h-14 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"><Brain size={14}/> IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"><Flame size={14}/> Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Trophy size={14}/> Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Dices size={14}/> Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><FileText size={14}/> Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><Grid3X3 size={14}/> Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white"><PlayCircle size={14}/> Guía</TabsTrigger>
              <TabsTrigger value="agencias" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 bg-emerald-500/10 text-emerald-700"><ShoppingCart size={14}/> Agencias</TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENIDOS DINÁMICOS */}
          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="space-y-10"><FrequencyHeatmap lotteryId={globalLottery} /></TabsContent>
          
          {/* PLACEHOLDERS PARA QUE NO ESTÉN VACÍOS */}
          <TabsContent value="deportes"><div className="p-20 text-center font-black uppercase border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">Sincronizando Líneas Deportivas...</div></TabsContent>
          <TabsContent value="ruleta"><div className="p-20 text-center font-black uppercase border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">Analítica de Ruleta Activa</div></TabsContent>
          <TabsContent value="guia"><div className="p-20 text-center font-black uppercase border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">Guía de Operación del Búnker</div></TabsContent>
          <TabsContent value="agencias"><div className="p-20 text-center font-black uppercase border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">Puntos de Jugada Oficiales</div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
