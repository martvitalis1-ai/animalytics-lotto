import { useState, useEffect } from 'react';
import { supabase } from "../integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LOTTERIES } from '../lib/constants';
import { getAnimalImageUrl } from '../lib/animalData';
import { History, Loader2 } from "lucide-react";

export function ResultsPanel({ isAdmin }: { isAdmin: boolean }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);

  const fetchResults = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', selectedDate)
      .eq('lottery_type', selectedLottery)
      .order('draw_time', { ascending: true });
    setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResults(); }, [selectedDate, selectedLottery]);

  return (
    <Card className="border-none shadow-none bg-white">
      <CardHeader className="pb-4 bg-slate-50/50 rounded-t-[3rem]">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <CardTitle className="text-2xl font-black uppercase italic flex items-center gap-2 text-primary">
            <History size={24} /> Bóveda de Resultados
          </CardTitle>
          <div className="flex gap-2">
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-white rounded-xl font-bold w-40" />
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="w-48 bg-white rounded-xl font-bold uppercase text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{LOTTERIES.map(l => (<SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 bg-white">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-6 bg-slate-50/30 border border-slate-100 rounded-[2.5rem]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Sorteo</span>
                  <span className="font-mono font-black text-xl">{r.draw_time}</span>
                </div>
                {/* IMAGEN 3D GIGANTE SIN TEXTO ABAJO */}
                <div className="w-28 h-28 lg:w-36 lg:h-36">
                  <img 
                    src={getAnimalImageUrl(r.result_number)} 
                    className="w-full h-full object-contain drop-shadow-xl" 
                    alt="" 
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
