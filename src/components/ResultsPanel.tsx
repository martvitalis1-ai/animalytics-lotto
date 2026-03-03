// COPIA DESDE AQUÍ
import { useState, useEffect, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LOTTERIES, getDrawTimesForLottery, getAnimalFromNumber } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { RichAnimalCard } from './RichAnimalCard';
import { toast } from "sonner";
import { Pencil, Trash2, Save, X, Calendar, FileSpreadsheet, Loader2, Info, History } from "lucide-react";

interface Result {
  id: number;
  lottery_type: string;
  result_number: string;
  animal_name: string | null;
  draw_time: string;
  draw_date: string;
  created_at: string;
}

interface ResultsPanelProps {
  isAdmin: boolean;
}

export function ResultsPanel({ isAdmin }: ResultsPanelProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editTime, setEditTime] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  const availableTimes = getDrawTimesForLottery(selectedLottery);
  const selectedLotteryData = LOTTERIES.find(l => l.id === selectedLottery);

const fetchResults = async () => {
    setLoading(true);
    
    // Quitamos filtros innecesarios y aumentamos el límite
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', selectedDate)
      .eq('lottery_type', selectedLottery)
      .order('draw_time', { ascending: true })
      .limit(5000); // <--- OBLIGATORIO PARA VER TODO EL HISTORIAL
    
    if (error) {
      toast.error("Error al cargar resultados");
      console.error(error);
    } else {
      setResults(data || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, [selectedDate, selectedLottery]);

  useEffect(() => {
    const channel = supabase
      .channel('results-panel-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_results' }, () => fetchResults())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate, selectedLottery]);

  const startEdit = (result: Result) => {
    if (!isAdmin) return;
    setEditingId(result.id);
    setEditNumber(result.result_number);
    setEditTime(result.draw_time);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNumber("");
    setEditTime("");
  };

  const saveEdit = async () => {
    if (!editingId || !editNumber.trim()) return;
    const result = results.find(r => r.id === editingId);
    const animalName = getAnimalFromNumber(editNumber, result?.lottery_type || '');
    
    const { error } = await supabase
      .from('lottery_results')
      .update({
        result_number: editNumber.padStart(2, '0').replace('000', '00'),
        animal_name: animalName || null,
        draw_time: editTime,
      })
      .eq('id', editingId);
    
    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Actualizado");
      cancelEdit();
      fetchResults();
    }
  };

  const confirmDelete = (id: number) => {
    if (!isAdmin) return;
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from('lottery_results').delete().eq('id', deletingId);
    if (!error) {
      toast.success("Eliminado");
      setDeleteDialogOpen(false);
      fetchResults();
    }
  };

  const resultsByTime = results.reduce((acc, r) => {
    // Normalizamos la hora para que coincida con el mapeo (ej: 8:00 AM -> 08:00 AM)
    let timeKey = r.draw_time.trim().toUpperCase();
    if (timeKey.length === 7) timeKey = '0' + timeKey;
    acc[timeKey] = r;
    return acc;
  }, {} as Record<string, Result>);

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader className="pb-3 bg-muted/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-xl font-black flex items-center gap-2 uppercase italic text-primary">
            <History className="w-6 h-6" />
            Bóveda Histórica
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black">
              {results.length} REGISTROS CARGADOS
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Seleccionar Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-primary" />
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 font-bold bg-background border-primary/20 h-10"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Seleccionar Lotería</label>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="font-bold border-primary/20 h-10 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 px-6 bg-primary text-primary-foreground rounded-2xl shadow-xl">
          <img src={getLotteryLogo(selectedLottery)} alt="" className="w-12 h-12 rounded-full bg-white p-1" />
          <div>
            <p className="font-black text-lg leading-none uppercase">{selectedLotteryData?.name}</p>
            <p className="text-xs opacity-80 font-bold mt-1">Viendo resultados del día {selectedDate}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-xs font-black uppercase text-muted-foreground animate-pulse">Abriendo Bóveda...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {availableTimes.map((time, idx) => {
              // Normalizamos el tiempo para comparar
              let normalizedTime = time.trim().toUpperCase();
              if (normalizedTime.length === 7) normalizedTime = '0' + normalizedTime;
              
              const result = resultsByTime[normalizedTime];
              const hasResult = !!result;
              
              return (
                <div key={time} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${hasResult ? 'bg-card border-primary/10 shadow-sm' : 'bg-muted/10 border-transparent opacity-40'}`}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">Hora del Sorteo</span>
                    <span className="font-mono font-black text-base">{time}</span>
                  </div>

                  <div className="flex-1 flex justify-center">
                    {editingId === result?.id ? (
                      <Input
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                        className="h-10 w-20 text-center font-black text-xl border-primary"
                        autoFocus
                      />
                    ) : hasResult ? (
                      <div className="flex items-center gap-4">
                         <span className="text-4xl">{getAnimalEmoji(result.result_number)}</span>
                         <div className="text-left">
                           <span className="block font-mono font-black text-2xl leading-none">#{result.result_number}</span>
                           <span className="text-[10px] font-black uppercase text-primary leading-none">{getAnimalName(result.result_number, selectedLottery)}</span>
                         </div>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-muted-foreground italic">Pendiente por cargar</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && hasResult && (
                      editingId === result.id ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={saveEdit} className="h-9 w-9 bg-green-500/10 hover:bg-green-500/20"><Save className="w-5 h-5 text-green-600" /></Button>
                          <Button size="icon" variant="ghost" onClick={cancelEdit} className="h-9 w-9 bg-red-500/10 hover:bg-red-500/20"><X className="w-5 h-5 text-red-600" /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="icon" variant="ghost" onClick={() => startEdit(result)} className="h-8 w-8 hover:bg-primary/10"><Pencil className="w-4 h-4 text-muted-foreground" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => confirmDelete(result.id)} className="h-8 w-8 hover:bg-destructive/10"><Trash2 className="w-4 h-4 text-muted-foreground" /></Button>
                        </>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// HASTA AQUÍ
