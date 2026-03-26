import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { getDrawTimesForLottery } from '../lib/constants';
import { Grid3X3 } from "lucide-react";

export function FrequencyHeatmap({ lotteryId }: { lotteryId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const times = getDrawTimesForLottery(lotteryId);
  const codes = getCodesForLottery(lotteryId);

  useEffect(() => {
    async function loadFrequencies() {
      setLoading(true);
      
      let dbId = lotteryId.toLowerCase().trim();
      if (dbId === 'la_granjita') dbId = 'granjita';
      if (dbId === 'el_guacharo') dbId = 'guacharo';

      const { data: res, error } = await supabase
        .from('lottery_results')
        .select('result_number, draw_time')
        .eq('lottery_type', dbId)
        .order('draw_date', { ascending: false })
        .limit(1500);

      if (error) console.error("Error en Matriz:", error);

      setData(res || []);
      setLoading(false);
    }
    loadFrequencies();
  }, [lotteryId]);

  const freqMap = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(r => {
      if (!r.draw_time || !r.result_number) return;
      const tKey = r.draw_time.toString().replace(/\s/g, '').toUpperCase();
      const nKey = r.result_number.toString().trim().padStart(2, '0').replace('000', '00');
      map[`${tKey}-${nKey}`] = (map[`${tKey}-${setGlobalLottery}>
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
            <Button onClick={() => window.open('https://t.me/+BXV4GahQ4gswNmNh', '_blank')} className="bg-[#229ED9] h-10 px-4 rounded-xl shadow-lg border-2 border-white/20 active:scale-95 transition-all flex items-center gap-2">
              <Send size={16} className="fill-white" /><span className="hidden xs:inline font-black text-[10px]">CANAL VIP</span>
            </Button>
            <Button variant="ghost" onClick={onLogout} className="hidden md:flex text-white p-2 hover:bg-red-500 rounded-full transition-colors"><LogOut size={28} /></Button>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b-2 border-slate-200 sticky top-[110px] md:top-[128px] z-40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <TabsList className="bg-transparent h-auto w-full grid grid-cols-4 md:flex md:justify-center p-1 gap-1">
              {["ia", "explosivo", "deportes", "resultados", "matriz", "guia", "agencias"].map((t) => (
                <TabsTrigger key={t} value={t} className="px-1 py-2.5 font-black text-[9px] md:text-[11px] uppercase border-b-4 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none bg-transparent uppercase">{t}</TabsTrigger>
              ))}
              {isMaster && <TabsTrigger value="admin" className="px-4 border-b-4 border-transparent data-[state=active]:border-orange-500"><Settings size={20}/></TabsTrigger>}
            </TabsList>
          </div>
        </div>

        <div className="p-2 md:p-6 max-w-7xl mx-auto overflow-hidden">
          <TabsContent value="ia" className="mt-0"><HourlyPredictionView lotteryId={globalLottery} /></TabsContent>
          <TabsContent value="resultadosnKey}`] || 0) + 1;
    });
    return map;
  }, [data]);

  const getCellStyle = (count: number) => {
    if (count === 0) return 'text-slate-200 opacity-20 border-slate-100';
    if (count === 1) return 'bg-yellow-400 text-slate-900 border-white shadow-inner';
    if (count === 2) return 'bg-blue-500 text-white border-white';
    return 'bg-red-600 text-white border-white shadow-md'; 
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 uppercase italic text-xs">Sincronizando Matriz...</p>
    </div>
  );

  return (
    <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-3 md:p-6 shadow-2xl overflow-hidden relative">
      <div className="flex items-center gap-3 mb-6 px-2">
        <Grid3X3 className="text-emerald-500" size={24} />
        <h3 className="font-black text-xl md:text-2xl uppercase italic text-slate-900 tracking-tighter">MATRIZ ATÓMICA</h3>
      </div>
      
      <div className="overflow-x-auto border-4 border-slate-900 rounded-2xl">
        <table className="w-full border-collapse bg-white table-auto">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-2 border-r-4 border-slate-700 w-24 min-w-[90px] md:w-28 sticky left-0 bg-slate-900 z-20 font-black text-[10px] uppercase">
                Animal
              </th>
              {times.map(t => (
                <th key={t} className="p-0 border-r border-slate-7" className="mt-0"><ResultsPanel lotteryId={dbId} /></TabsContent>
          <TabsContent value="matriz" className="mt-0 space-y-12">
            <FrequencyHeatmap lotteryId={dbId} />
            <SequenceMatrixView lotteryId={dbId} />
          </TabsContent>
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
