import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Edit2, Save, X, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES } from "@/lib/constants";
import { getLotteryLogo } from "./LotterySelector";
import { getAnimalName } from "@/lib/animalData";

export function HistoryManager() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const search = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('lottery_results')
        .select('*')
        .eq('draw_date', date)
        .order('draw_time', { ascending: true });
      
      if (selectedLottery !== "all") {
        query = query.eq('lottery_type', selectedLottery);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      toast.error("Error al buscar historial");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este resultado del búnker?")) return;
    
    const { error } = await supabase.from('lottery_results').delete().eq('id', id);
    if (error) {
      toast.error("No se pudo eliminar");
    } else {
      toast.success("Resultado borrado");
      search();
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditValue(item.result_number);
  };

  const handleSaveEdit = async (id: number, lotteryType: string) => {
    if (!editValue.trim()) return;
    
    // BLINDAJE DE IDENTIDAD: Si es 0 o 00, se guarda literal. Si es 1-9, se le pone el 0.
    const finalValue = (editValue === '0' || editValue === '00') 
      ? editValue 
      : editValue.padStart(2, '0');

    const animalName = getAnimalName(finalValue);
    
    const { error } = await supabase
      .from('lottery_results')
      .update({ 
        result_number: finalValue, 
        animal_name: animalName 
      })
      .eq('id', id);
    
    if (error) {
      toast.error("Fallo al actualizar");
    } else {
      toast.success("Búnker actualizado");
      setEditingId(null);
      search();
    }
  };

  useEffect(() => {
    search();
  }, [date, selectedLottery]);

  // URL DE IMÁGENES 3D
  const get3D = (c: string) => `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${c === '0' || c === '00' ? c : c.padStart(2, '0')}.png`;

  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.lottery_type]) acc[r.lottery_type] = [];
    acc[r.lottery_type].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card className="glass-card border-2 border-primary/20 shadow-xl rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-muted/5 border-b">
        <CardTitle className="text-lg font-black uppercase italic flex items-center gap-2">
          <History className="text-primary" /> Gestionar Historial 3D
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap gap-3 p-4 bg-slate-100/50 rounded-3xl border border-slate-200">
          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] font-black uppercase ml-2 mb-1 text-slate-400">Fecha del Sorteo</p>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border-primary/20 font-bold rounded-2xl h-12"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] font-black uppercase ml-2 mb-1 text-slate-400">Filtrar Lotería</p>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="bg-white border-primary/20 font-bold rounded-2xl h-12">
                <SelectValue placeholder="Lotería" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">TODAS LAS LOTERÍAS</SelectItem>
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={search} disabled={loading} className="h-12 w-12 mt-5 rounded-2xl bg-primary text-white">
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </Button>
        </div>

        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(groupedResults).map(([lotteryId, items]) => {
            const lottery = LOTTERIES.find(l => l.id === lotteryId);
            const itemsArray = items as any[];
            return (
              <div key={lotteryId} className="space-y-3">
                <div className="flex items-center gap-3 sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 border-b">
                  <img src={getLotteryLogo(lotteryId)} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                  <span className="font-black text-sm uppercase tracking-tighter text-slate-700">{lottery?.name || lotteryId}</span>
                  <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-black">{itemsArray.length} sorteos</span>
                </div>
                
                <div className="grid gap-2">
                  {itemsArray.map((r: any) => (
                    <div 
                      key={r.id} 
                      className="flex items-center justify-between p-3 bg-white border-2 border-slate-50 rounded-3xl hover:border-primary/20 transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-xs text-slate-400 w-16 uppercase">{r.draw_time}</span>
                        
                        <div className="relative w-12 h-12 flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden">
                           <img 
                             src={get3D(r.result_number)} 
                             className="w-full h-full object-contain drop-shadow-md z-10" 
                             alt="" 
                             crossOrigin="anonymous"
                             onError={(e) => (e.currentTarget.style.opacity = '0')}
                           />
                           <span className="absolute text-[8px] font-black opacity-10 uppercase">{r.animal_name}</span>
                        </div>

                        {editingId === r.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.toUpperCase())}
                            className="w-20 h-10 text-center font-mono font-black text-xl border-primary"
                            autoFocus
                          />
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-mono font-black text-2xl leading-none text-primary">{r.result_number}</span>
                            <span className="text-[10px] font-black uppercase text-slate-400">{r.animal_name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {editingId === r.id ? (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(r.id, r.lottery_type)} className="h-10 w-10 bg-green-50 text-green-600 rounded-2xl"><Save size={18} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="h-10 w-10 bg-slate-50 text-slate-400 rounded-2xl"><X size={18} /></Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(r)} className="h-10 w-10 opacity-0 group-hover:opacity-100 hover:bg-primary/10 rounded-2xl transition-all"><Edit2 size={16} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDelete(r.id)} className="h-10 w-10 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"><Trash2 size={16} /></Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {results.length === 0 && !loading && (
            <div className="text-center py-20 opacity-30 grayscale flex flex-col items-center">
              <History size={60} className="mb-4" />
              <p className="font-black uppercase tracking-widest text-sm">Sin registros en esta fecha</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
