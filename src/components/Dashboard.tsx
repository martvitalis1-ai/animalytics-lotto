import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, Settings, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { Button } from "@/components/ui/button";

export function Dashboard({ onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="font-black text-lg uppercase italic tracking-tighter">ANIMALYTICS PRO</h1>
          </div>

          <div className="flex items-center gap-4">
            <Select value={globalLottery} onValueChange={setGlobalLottery}>
              <SelectTrigger className="w-44 h-10 rounded-xl font-black uppercase text-[10px] bg-slate-50 border-2 border-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" /> {l.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full hover:bg-red-50 hover:text-red-500">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* NAVEGACIÓN DE 8 SECCIONES (IGUAL A TU FOTO 2) */}
          <div className="flex justify-center overflow-x-auto no-scrollbar -mx-4 px-4">
            <TabsList className="bg-slate-100 p-1 rounded-full h-14 border border-slate-200 flex-nowrap shrink-0">
              <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><Brain size={14}/> IA</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><Flame size={14}/> Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><Trophy size={14}/> Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><Dices size={14}/> Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><FileText size={14}/> Resultados</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><Grid3X3 size={14}/> Matriz</TabsTrigger>
              <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[10px] uppercase gap-2"><PlayCircle size={14}/> Guía</TabsTrigger>
              <TabsTrigger value="agencias" className="rounded-full px-6 font-black text-[10px] uppercase gap-2 bg-emerald-500/10 text-emerald-700"><ShoppingCart size={14}/> Agencias</TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENIDOS */}
          <TabsContent value="ia"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz"><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="deportes"><div className="p-20 text-center font-black uppercase text-slate-300">Sección Deportes Próximamente...</div></TabsContent>
          <TabsContent value="ruleta"><div className="p-20 text-center font-black uppercase text-slate-300">Sección Ruleta Próximamente...</div></TabsContent>
          <TabsContent value="guia"><div className="p-20 text-center font-black uppercase text-slate-300">Sección Guía de Uso Próximamente...</div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
