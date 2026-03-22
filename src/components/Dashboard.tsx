import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Flame, Grid3X3, Database, ShieldCheck, Zap, Settings, LogOut, TrendingUp, Clock } from "lucide-react";
import { LOTTERIES } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { HourlyPredictionView } from "./HourlyPredictionView"; 
import { SequenceMatrixView } from "./SequenceMatrixView"; 
import { ExplosiveData } from "./ExplosiveData";
import { ResultsPanel } from "./ResultsPanel";
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
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* HEADER DE MANDO */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoAnimalytics} alt="Logo" className="h-10 w-auto" />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <h1 className="font-black text-lg uppercase italic tracking-tighter leading-none">
                {tenantAgency?.nombre || "ANIMALYTICS PRO"}
              </h1>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                {totalCount.toLocaleString()}+ SORTEOS REGISTRADOS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <Select value={globalLottery} onValueChange={setGlobalLottery}>
                <SelectTrigger className="w-44 lg:w-52 h-10 border-none bg-transparent font-black uppercase text-[11px] focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl">
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
            <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full hover:bg-red-50 hover:text-red-500">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-slate-100 p-1.5 rounded-full h-14 shadow-inner border border-slate-200">
              <TabsTrigger value="ia" className="rounded-full px-8 font-black text-xs uppercase italic">IA Predictiva</TabsTrigger>
              <TabsTrigger value="explosivo" className="rounded-full px-8 font-black text-xs uppercase italic">Explosivos</TabsTrigger>
              <TabsTrigger value="matriz" className="rounded-full px-8 font-black text-xs uppercase italic">Matriz</TabsTrigger>
              <TabsTrigger value="resultados" className="rounded-full px-8 font-black text-xs uppercase italic">Bóveda</TabsTrigger>
            </TabsList>
          </div>

          {/* CONTENIDO IA: PRÓXIMO SORTEO + ANALÍTICA (CALIENTES/FRÍOS/ETC) */}
          <TabsContent value="ia" className="space-y-10">
            <HourlyPredictionView lotteryId={globalLottery} />
          </TabsContent>

          {/* MATRIZ: Mapa térmico movido aquí */}
          <TabsContent value="matriz">
            <SequenceMatrixView lotteryId={globalLottery} />
          </TabsContent>
          
          <TabsContent value="explosivo">
            <ExplosiveData lotteryId={globalLottery} />
          </TabsContent>

          <TabsContent value="resultados">
            <ResultsPanel isAdmin={userRole === 'admin'} lotteryId={globalLottery} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
