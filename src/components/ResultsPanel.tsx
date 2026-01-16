import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LOTTERIES, DRAW_TIMES, ANIMAL_MAPPING, getAnimalFromNumber } from '@/lib/constants';
import { getLotteryLogo } from "./LotterySelector";
import { toast } from "sonner";
import { Pencil, Trash2, Save, X, Calendar, Search, Loader2 } from "lucide-react";

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
  const [selectedLottery, setSelectedLottery] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editTime, setEditTime] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    
    let query = supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', selectedDate)
      .order('draw_time', { ascending: true });
    
    if (selectedLottery !== "all") {
      query = query.eq('lottery_type', selectedLottery);
    }
    
    const { data, error } = await query;
    
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

  // Suscripción en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('results-panel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lottery_results' },
        () => fetchResults()
      )
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate, selectedLottery]);

  const startEdit = (result: Result) => {
    if (!isAdmin) {
      toast.error("Solo administradores pueden editar");
      return;
    }
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
    
    const animalName = getAnimalFromNumber(editNumber, results.find(r => r.id === editingId)?.lottery_type || '');
    
    const { error } = await supabase
      .from('lottery_results')
      .update({
        result_number: editNumber.padStart(2, '0'),
        animal_name: animalName || null,
        draw_time: editTime,
      })
      .eq('id', editingId);
    
    if (error) {
      toast.error("Error al actualizar");
      console.error(error);
    } else {
      toast.success("Resultado actualizado");
      cancelEdit();
      fetchResults();
    }
  };

  const confirmDelete = (id: number) => {
    if (!isAdmin) {
      toast.error("Solo administradores pueden eliminar");
      return;
    }
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    const { error } = await supabase
      .from('lottery_results')
      .delete()
      .eq('id', deletingId);
    
    if (error) {
      toast.error("Error al eliminar");
      console.error(error);
    } else {
      toast.success("Resultado eliminado");
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchResults();
    }
  };

  // Agrupar resultados por lotería
  const groupedResults = results.reduce((acc, r) => {
    if (!acc[r.lottery_type]) acc[r.lottery_type] = [];
    acc[r.lottery_type].push(r);
    return acc;
  }, {} as Record<string, Result[]>);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Panel de Resultados
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{results.length} resultados</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40 bg-background"
            />
          </div>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-44 bg-background">
              <SelectValue placeholder="Todas las loterías" />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              <SelectItem value="all">Todas las loterías</SelectItem>
              {LOTTERIES.map((l) => (
                <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de resultados */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto">
            {Object.entries(groupedResults).map(([lotteryId, items]) => {
              const lottery = LOTTERIES.find(l => l.id === lotteryId);
              
              return (
                <div key={lotteryId} className="space-y-2">
                  <div className="flex items-center gap-2 sticky top-0 bg-card py-2 border-b z-10">
                    <img src={getLotteryLogo(lotteryId)} alt="" className="w-8 h-8" />
                    <span className="font-bold">{lottery?.name || lotteryId}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {items.length} sorteos
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="excel-table">
                      <thead>
                        <tr>
                          <th className="w-24">Hora</th>
                          <th className="w-20">Número</th>
                          <th className="w-28">Animal</th>
                          {isAdmin && <th className="w-24 text-center">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((r, idx) => (
                          <tr key={r.id} className={idx % 2 === 0 ? '' : 'bg-muted/30'}>
                            <td>
                              {editingId === r.id ? (
                                <Select value={editTime} onValueChange={setEditTime}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border shadow-lg max-h-48">
                                    {DRAW_TIMES.map(t => (
                                      <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="font-medium">{r.draw_time}</span>
                              )}
                            </td>
                            <td>
                              {editingId === r.id ? (
                                <Input
                                  value={editNumber}
                                  onChange={(e) => setEditNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                  className="h-8 w-16 text-center font-mono font-bold"
                                  maxLength={2}
                                />
                              ) : (
                                <span className="font-mono font-black text-lg">{r.result_number}</span>
                              )}
                            </td>
                            <td className="text-sm">
                              {r.animal_name || ANIMAL_MAPPING[r.result_number] || '-'}
                            </td>
                            {isAdmin && (
                              <td className="text-center">
                                {editingId === r.id ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 w-7 p-0">
                                      <Save className="w-4 h-4 text-primary" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-7 w-7 p-0">
                                      <X className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => startEdit(r)} className="h-7 w-7 p-0">
                                      <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => confirmDelete(r.id)} className="h-7 w-7 p-0">
                                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            
            {results.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No hay resultados para esta fecha
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar resultado?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer. El resultado será eliminado permanentemente.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
