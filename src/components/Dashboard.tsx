import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Brain, 
  Flame, 
  Grid3X3, 
  Database, 
  ShieldCheck, 
  Zap, 
  LogOut, 
  TrendingUp,
  Clock,
  Calendar
} from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { Button } from "@/components/ui/button";
import logoAnimalytics from "@/assets/logo-animalytics.png";

interface DashboardProps {
  userRole: string;
  onLogout: () => void;
  tenantAgency?: any;
}

export function Dashboard({ userRole, onLogout, tenantAgency }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const isMasterAdmin = userRole === 'admin';

  // Sincronizar el título de la pestaña con la lotería seleccionada
  useEffect(() => {
    const lotName = LOTTERIES.find(l => l.id === globalLottery)?.name || "Bunker";
    document.title = `${lotName} | Animalytics Pro`;
  }, [globalLottery]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      
      {/* 1. HEADER DE MANDO PROFESIONAL */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo e Identidad */}
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <h1 className="font-black text-lg uppercase italic tracking-tighter leading-none">
                {tenantAgency?.nombre || "ANIMALYTICS PRO"}
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">
                Military Grade Analytics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* SELECTOR MAESTRO DE LOTERÍA (El Volante del Búnker) */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100 shadow-inner">
              <span className="hidden lg:block text-[9px] font-black uppercase text-slate-400 ml-3">
                Lotería Activa:
              </span>
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-40 lg:w-52 h-9 border-none bg-transparent font-black uppercase text-[11px] shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  {LOTTERIES.map(l => (
                    <SelectItem key={l.id} value={l.id} className="font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} className="w-4 h-4 rounded-full" alt="" /> 
                        {l.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* BOTÓN SALIR */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout} 
              className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-8">
        
        {/* 2. RECOMENDACIÓN DE ALTO IMPACTO (IA BANNER) */}
        <div className="bg-slate-900 p-6 lg:p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden border-b-8 border-emerald-500">
           <ShieldCheck className="absolute right-[-20px] bottom-[-20px] size-48 opacity-10 rotate-12 text-emerald-400" />
           <div className="bg-emerald-500 p-4 lg:p-6 rounded-[2rem] shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Zap size={32} className="fill-white text-white animate-pulse" />
           </div>
           <div className="text-center md:text-left flex-1 z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                Sugerencia Técnica de Inteligencia
              </p>
              <h2 className="text-2xl lg:text-3xl font-black italic uppercase leading-none mt-1 tracking-tighter">
                Ciclo de Repetición Detectado
              </h2>
              <p className="text-sm font-medium text-slate-300 mt-2 max-w-xl">
                La matriz de frecuencia sugiere priorizar animales enjaulados para los sorteos de la tarde en {LOTTERIES.find(l => l.id === globalLottery)?.name}.
              </p>
           </div>
        </div>

        {/* 3. NAVEGACIÓN TIPO SOFTWARE (TABS) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 shadow-inner border border-slate-200 w-full max-w-3xl overflow-x-auto no-scrollbar">
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

          {/* 4. CONTENIDOS DINÁMICOS POR PESTAÑA */}
          
          <TabsContent value="ia" className="animate-in fade-in slide-in-from-bottom-4 duration-700 outline-none">
            {/* Componente que incluye Calientes, Fríos, Enjaulados y Horarios */}
            <HourlyPredictionView lotteryId={globalLottery} />
          </TabsContent>

          <TabsContent value="matriz" className="animate-in fade-in duration-500 outline-none">
            <div className="space-y-10">
               <SequenceMatrixView lotteryId={globalLottery} />
            </div>
          </TabsContent>
          
          <TabsContent value="explosivo" className="animate-in zoom-in-95 duration-500 outline-none">
            <ExplosiveData lotteryId={globalLottery} />
          </TabsContent>

          <TabsContent value="resultados" className="animate-in fade-in duration-500 outline-none">
            <ResultsPanel isAdmin={isMasterAdmin} lotteryId={globalLottery} />
          </TabsContent>
        </Tabs>
      </main>

      {/* 5. FOOTER DE CALIDAD (BRANDING) */}
      <footer className="p-16 text-center opacity-10 pointer-events-none mt-20">
        <div className="flex flex-col items-center gap-2">
          <TrendingUp size={40} />
          <p className="text-[11px] font-black uppercase tracking-[0.8em]">
            ANIMALYTICS PRO — DATA CENTER
          </p>
        </div>
      </footer>
    </div>
  );
}
