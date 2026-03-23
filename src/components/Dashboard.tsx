import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut } from "lucide-react";
import { LOTTERIES } from '../lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { Button } from "./ui/button";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMaster = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      {/* 1. CABECERA DE MANDO (Negro y Verde) */}
      <header className="sticky top-0 z-50 bg-slate-900 text-white border-b-8 border-emerald-600 px-4 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="font-black text-xl italic tracking-tighter text-emerald-400 leading-none">
                {tenantAgency?.nombre || "ANIMALYTICS PRO"}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                Military Grade Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl p-1 border-2 border-emerald-500 shadow-lg">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-40 lg:w-48 h-8 border-none bg-transparent font-black uppercase text-[10px] text-slate-900 focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-slate-900 shadow-2xl z-[100]">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-xs uppercase">
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" /> {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-600 rounded-full"><LogOut size={20} /></Button>
          </div>
        </div>
      </header>

      <main className="p-2 md:p-6 max-w-7xl mx-auto">
        {/* LA CLAVE: El TabsList es hijo DIRECTO de Tabs para que no falle el contexto */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          
          <TabsList className="bg-white p-1 rounded-full h-16 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex overflow-x-auto no-scrollbar w-full">
            <TabsTrigger value="ia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white min-w-fit flex-1 transition-all"><Brain size={14}/> IA</TabsTrigger>
            <TabsTrigger value="explosivo" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white min-w-fit flex-1 transition-all"><Flame size={14}/> Explosivo</TabsTrigger>
            <TabsTrigger value="deportes" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white min-w-fit flex-1 transition-all"><Trophy size={14}/> Deportes</TabsTrigger>
            <TabsTrigger value="ruleta" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white min-w-fit flex-1 transition-all"><Dices size={14}/> Ruleta</TabsTrigger>
            <TabsTrigger value="resultados" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white min-w-fit flex-1 transition-all"><FileText size={14}/> Resultados</TabsTrigger>
            <TabsTrigger value="matriz" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white min-w-fit flex-1 transition-all"><Grid3X3 size={14}/> Matriz</TabsTrigger>
            <TabsTrigger value="guia" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white min-w-fit flex-1 transition-all"><PlayCircle size={14}/> Guía</TabsTrigger>
            <TabsTrigger value="agencias" className="rounded-full px-6 font-black text-[11px] uppercase gap-2 bg-emerald-500/10 text-emerald-700 min-w-fit flex-1 transition-all"><ShoppingCart size={14}/> Agencias</TabsTrigger>
          </TabsList>

          <TabsContent value="ia" className="outline-none"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados" className="outline-none"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="outline-none space-y-12"><FrequencyHeatmap lotteryId={globalLottery} /><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo" className="outline-none"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          
          <TabsContent value="deportes" className="outline-none">
            <div className="p-20 text-center border-4 border-slate-900 bg-white rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <Trophy size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic text-slate-800 tracking-tighter leading-none">Líneas Deportivas en Sincronización</h3>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Calculando cuotas de Las Vegas...</p>
            </div>
          </TabsContent>

          <TabsContent value="ruleta" className="outline-none">
            <div className="p-20 text-center border-4 border-slate-900 bg-white rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <Dices size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic text-slate-800 tracking-tighter leading-none">Analítica de Ruleta Activa</h3>
            </div>
          </TabsContent>

          <TabsContent value="guia" className="outline-none">
            <div className="p-20 text-center border-4 border-slate-900 bg-white rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <PlayCircle size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic text-slate-800 tracking-tighter leading-none">Guía de Operación Maestro</h3>
            </div>
          </TabsContent>

          <TabsContent value="agencias" className="outline-none">
            <div className="p-20 text-center border-4 border-slate-900 bg-white rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
              <ShoppingCart size={60} className="text-slate-200 mb-4" />
              <h3 className="font-black uppercase text-2xl italic text-slate-800 tracking-tighter leading-none">Puntos de Jugada Oficiales</h3>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
