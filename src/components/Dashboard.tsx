import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Grid3X3, Database, ShieldCheck, Zap, Settings, LogOut, TrendingUp } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { Button } from "@/components/ui/button";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");

  const isMasterAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* 1. HEADER DE MANDO: SELECTOR GLOBAL Y LOGO */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <h1 className="font-black text-lg uppercase italic tracking-tighter leading-none">
                {tenantAgency?.nombre || "ANIMALYTICS PRO"}
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Inteligencia de Datos</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* SELECTOR MAESTRO DE LOTERÍA */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <span className="hidden md:block text-[9px] font-black uppercase text-slate-400 ml-3">Lotería Activa:</span>
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-44 lg:w-52 h-10 border-none bg-transparent font-black uppercase text-[11px] shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
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

            {/* BOTÓN SALIR */}
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full hover:bg-red-50 hover:text-red-500">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-8">
        
        {/* 2. NAVEGACIÓN PRINCIPAL (TABS) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 shadow-inner border border-slate-200 w-full max-w-2xl">
              <TabsTrigger value="ia" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                <Brain size={14}/> IA Predictiva
              </TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                <Flame size={14}/> Explosivos
              </TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                <Grid3X3 size={14}/> Matriz
              </TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-4 lg:px-8 font-black text-[10px] lg:text-xs uppercase tracking-tighter data-[state=active]:bg-white data-[state=active]:shadow-md transition-all gap-2">
                <Database size={14}/> Bóveda
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 3. CONTENIDOS DINÁMICOS */}
          
          {/* SECCIÓN IA: Análisis Térmico, Horarios y Recomendación */}
          <TabsContent value="ia" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <HourlyPredictionView lotteryId={globalLottery} />
          </TabsContent>

          {/* SECCIÓN MATRIZ: El Mapa Térmico y Secuencias */}
          <TabsContent value="matriz" className="animate-in fade-in duration-500">
            <div className="space-y-10">
               <SequenceMatrixView lotteryId={globalLottery} />
            </div>
          </TabsContent>
          
          {/* SECCIÓN EXPLOSIVOS: Animales de alto impacto */}
          <TabsContent value="explosivo" className="animate-in zoom-in-95 duration-500">
            <ExplosiveData lotteryId={globalLottery} />
          </TabsContent>

          {/* SECCIÓN BÓVEDA: Resultados Históricos */}
          <TabsContent value="resultados" className="animate-in fade-in duration-500">
            <ResultsPanel isAdmin={isMasterAdmin} lotteryId={globalLottery} />
          </TabsContent>
        </Tabs>
      </main>

      {/* FOOTER DE CALIDAD */}
      <footer className="p-12 text-center opacity-20 pointer-events-none">
        <div className="flex flex-col items-center gap-2">
          <TrendingUp size={30} />
          <p className="text-[10px] font-black uppercase tracking-[0.6em]">
            Animalytics Pro — Military Grade Precision
          </p>
        </div>
      </footer>
    </div>
  );
}
