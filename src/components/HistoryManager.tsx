import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, ANIMAL_MAPPING } from "@/lib/constants";
import { getLotteryLogo } from "./LotterySelector";

export function HistoryManager() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLottery, setSelectedLottery] = useState<string>("all");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const search = async () => {
    setLoading(true);
    let query = supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', date)
      .order('draw_time', { ascending: true });
    
    if (selectedLottery !== "all") {
      query = query.eq('lottery_type', selectedLottery);
    }
    
    const { data, error } = await query;
    
    if (error) {
      toast.error("Error al buscar");
    } else {
      setResults(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este resultado?")) return;
    
    const { error } = await supabase.from('lottery_results').delete().eq('id', id);
    if (error) {
      toast.error("Error al eliminar");
    } else {
      toast.success("Eliminado");
      search();
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditValue(item.result_number);
  };

  const handleSaveEdit = async (id: number, lotteryType: string) => {
    const animalName = ANIMAL_MAPPING[editValue] || null;
    
    const { error } = await supabase
      .from('lottery_results')
      .update({ result_number: editValue.padStart(2, '0'), animal_name: animalName })
      .eq('id', id);
    
    if (error) {
      toast.error("Error al actualizar");
    } else {
      toast.success("Actualizado");
      setEditingId(null);
      search();
    }
  };

  useEffect(() => {
    search();
  }, []);

  // Agrupar por lotería
  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.lottery_type]) acc[r.lottery_type] = [];
    acc[r.lottery_type].push(r);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Gestionar Historial</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-background"
          />
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue placeholder="Lotería" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              <SelectItem value="all">Todas</SelectItem>
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={search} disabled={loading} className="bg-foreground text-background hover:bg-foreground/90">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedResults).map(([lotteryId, items]) => {
            const lottery = LOTTERIES.find(l => l.id === lotteryId);
            const itemsArray = items as any[];
            return (
              <div key={lotteryId} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-card py-1">
                  <img src={getLotteryLogo(lotteryId)} alt="" className="w-6 h-6" />
                  <span className="font-bold text-sm">{lottery?.name || lotteryId}</span>
                  <span className="text-xs text-muted-foreground">({itemsArray.length})</span>
                </div>
                
                <div className="grid gap-1">
                  {itemsArray.map((r: any) => (
                    <div 
                      key={r.id} 
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs w-20">{r.draw_time}</span>
                        {editingId === r.id ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            className="w-16 h-8 text-center font-mono font-bold"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono font-black text-lg">{r.result_number}</span>
                        )}
                        {r.animal_name && (
                          <span className="text-xs text-muted-foreground">{r.animal_name}</span>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {editingId === r.id ? (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleSaveEdit(r.id, r.lottery_type)}
                              className="h-7 w-7 text-primary"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => setEditingId(null)}
                              className="h-7 w-7"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(r)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDelete(r.id)}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
            <p className="text-center text-muted-foreground text-sm py-8">
              No hay resultados para esta fecha
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
