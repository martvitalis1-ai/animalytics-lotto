import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Flame, Trophy, Dices, FileText, Grid3X3, PlayCircle, ShoppingCart, LogOut, Settings } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
import { FrequencyHeatmap } from "./FrequencyHeatmap";
import { ModuloJugadas } from "./ModuloJugadas"; // Restaurado
import { GuiaUso } from "./GuiaUso"; // Restaurado
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoAnimalytics from "@/assets/logo-animalytics.png";

export function Dashboard({ userRole, onLogout, tenantAgency }: any) {
  const [activeTab, setActiveTab] = useState("ia");
  const [globalLottery, setGlobalLottery] = useState("lotto_activo");
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase.from('lottery_results').select('*', { count: 'exact', head: true });
      if (count) setTotalCount(count);
    };
    fetchCount();
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* HEADER PRINCIPAL - FONDO SÓLIDO (FIX VIDEO) */}
      <header className="bg-slate-900 text-white border-b-4 border-emerald-500 px-4 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-slate-700 pl-3">
              <h1 className="font-black text-lg uppercase italic tracking-tighter text-emerald-400 leading-none">
                {tenantAgency?.nombre || "ANIMALYTICS PRO"}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                {totalCount.toLocaleString()}+ SORTEOS REGISTRADOS
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-red-500 rounded-full">
            <LogOut size={20} />
          </Button>
        </div>
      </header>

      {/* BARRA DE CONTROL DE LOTERÍA (FIX: NO ES TRANSPARENTE) */}
      <div className="sticky top-0 z-40 bg-slate-100 border-b-2 border-slate-900 p-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-500 italic">Lotería en Análisis:</span>
            <Select value={globalLottery} onValueChange={setGlobalLottery}>
              <SelectTrigger className="w-56 h-10 bg-white border-2 border-slate-900 font-black uppercase text-[10px] rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-2 border-slate-900 shadow-2xl">
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

          {/* TABS DE NAVEGACIÓN (RESPONSIVO FIX FOTO 9) */}
          <div className="flex overflow-x-auto no-scrollbar max-w-full">
            <TabsList className="bg-white p-1 rounded-full h-12 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-nowrap shrink-0">
              <TabsTrigger value="ia" onClick={()=>setActiveTab("ia")} className="rounded-full px-4 font-black text-[10px] uppercase data-[state=active]:bg-emerald-500 data-[state=active]:text-white">IA</TabsTrigger>
              <TabsTrigger value="explosivo" onClick={()=>setActiveTab("explosivo")} className="rounded-full px-4 font-black text-[10px] uppercase data-[state=active]:bg-orange-500 data-[state=active]:text-white">Explosivo</TabsTrigger>
              <TabsTrigger value="deportes" onClick={()=>setActiveTab("deportes")} className="rounded-full px-4 font-black text-[10px] uppercase">Deportes</TabsTrigger>
              <TabsTrigger value="ruleta" onClick={()=>setActiveTab("ruleta")} className="rounded-full px-4 font-black text-[10px] uppercase">Ruleta</TabsTrigger>
              <TabsTrigger value="resultados" onClick={()=>setActiveTab("resultados")} className="rounded-full px-4 font-black text-[10px] uppercase">Resultados</TabsTrigger>
              <TabsTrigger value="matriz" onClick={()=>setActiveTab("matriz")} className="rounded-full px-4 font-black text-[10px] uppercase">Matriz</TabsTrigger>
              <TabsTrigger value="guia" onClick={()=>setActiveTab("guia")} className="rounded-full px-4 font-black text-[10px] uppercase">Guía</TabsTrigger>
              <TabsTrigger value="agencias" onClick={()=>setActiveTab("agencias")} className="rounded-full px-4 font-black text-[10px] uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Agencias</TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>

      <main className="p-4 max-w-7xl mx-auto">
        <Tabs value={activeTab} className="space-y-8">
          <TabsContent value="ia" className="space-y-10"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="explosivo"><ExplosiveData lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultados"><ResultsPanel lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="matriz" className="space-y-12"><FrequencyHeatmap lotteryId={globalLottery} /><SequenceMatrixView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="agencias"><ModuloJugadas forcedAgency={tenantAgency} /></TabsContent>
          <TabsContent value="guia"><GuiaUso /></TabsContent>
          <TabsContent value="deportes"><div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic">Sincronizando Líneas de Las Vegas...</div></TabsContent>
          <TabsContent value="ruleta"><div className="p-20 text-center border-2 border-slate-900 bg-white rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic">Analítica de Ruleta Activa</div></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
