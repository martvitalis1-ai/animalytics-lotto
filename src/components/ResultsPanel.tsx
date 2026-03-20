import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES, getDrawTimesForLottery, getAnimalFromNumber } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalName } from '@/lib/animalData';
import { toast } from "sonner";
import { Pencil, Trash2, Save, X, Calendar, Loader2, History } from "lucide-react";

export function ResultsPanel({ isAdmin }: { isAdmin: boolean }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    // BLINDAJE 429: Bajamos de 5000 a 100 registros para que Supabase no te bloquee
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', selectedDate)
      .eq('lottery_type', selectedLottery)
      .order('draw_time', { ascending: true })
      .limit(100);
    
    if (!error) setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResults(); }, [selectedDate, selectedLottery]);

  const saveEdit = async (id: number) => {
    if (!editNumber.trim()) return;
    const finalNum = editNumber.trim();
    const animalName = getAnimalFromNumber(finalNum, selectedLottery);
    
    const { error } = await supabase
      .from('lottery_results')
      .update({ result_number: finalNum, animal_name: animalName || null })
      .eq('id', id);
    
    if (!error) {
      toast.success("Actualizado");
      setEditingId(null);
      fetchResults();
    }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader className="pb-3 bg-muted/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-2 uppercase italic text-primary">
            <History className="w-6 h-6" /> Bóveda Histórica
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-2xl">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="font-bold" />
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="font-bold"><SelectValue /></SelectTrigger>
            <SelectContent>{LOTTERIES.map((l) => (<SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : (
// Dentro de su ResultsPanel.tsx, reemplace la parte del mapeo visual por esta:
<div className="grid gap-3">
  {results.map((r) => (
    <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-slate-50 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-400 uppercase">Sorteo</span>
        <span className="font-mono font-black text-lg">{r.draw_time}</span>
      </div>
      <div className="flex items-center gap-4 bg-slate-50 px-6 py-2 rounded-2xl">
        <img 
          src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${(r.result_number === '0' || r.result_number === '00') ? r.result_number : r.result_number.padStart(2, '0')}.png`} 
          className="w-12 h-12 object-contain drop-shadow-md" 
          alt="" 
        />
        <div className="text-left">
          <span className="block font-mono font-black text-3xl leading-none text-primary">#{r.result_number}</span>
          <span className="text-[10px] font-black uppercase text-slate-400">{r.animal_name}</span>
        </div>
      </div>
      {isAdmin && <Button size="sm" variant="ghost" onClick={() => { setEditingId(r.id); setEditNumber(r.result_number); }}><Pencil size={18}/></Button>}
    </div>
  ))}
</div>
