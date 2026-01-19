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
import { Pencil, Trash2, Save, X, Calendar, FileSpreadsheet, Loader2, Info } from "lucide-react";

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

  // Obtener horarios para la lotería seleccionada
  const availableTimes = getDrawTimesForLottery(selectedLottery);
  const selectedLotteryData = LOTTERIES.find(l => l.id === selectedLottery);

  const fetchResults = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('draw_date', selectedDate)
      .eq('lottery_type', selectedLottery)
      .order('draw_time', { ascending: true });
    
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
    
    const result = results.find(r => r.id === editingId);
    const animalName = getAnimalFromNumber(editNumber, result?.lottery_type || '');
    
    const { error } = await supabase
      .from('lottery_results')
      .update({
        result_number: editNumber === "00" ? "00" : editNumber === "0" ? "0" : editNumber.padStart(2, '0'),
        animal_name: animalName || null,
        draw_time: editTime,
      })
      .eq('id', editingId);
    
    if (error) {
      toast.error("Error al actualizar");
      console.error(error);
    } else {
      toast.success("Resultado actualizado correctamente");
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

  // Crear mapa de resultados por hora
  const resultsByTime = results.reduce((acc, r) => {
    acc[r.draw_time] = r;
    return acc;
  }, {} as Record<string, Result>);

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
            Historial de Resultados
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{results.length} resultados</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Formato tipo Excel. Selecciona fecha y lotería para ver/editar resultados.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Fecha</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40 bg-background"
              />
            </div>
          </div>
          
          <div className="space-y-1.5 flex-1 max-w-xs">
            <label className="text-xs font-medium text-muted-foreground">Lotería</label>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="bg-background">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(selectedLottery)} alt="" className="w-5 h-5" />
                    <span>{selectedLotteryData?.name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <div className="flex items-center gap-2">
                      <img src={getLotteryLogo(l.id)} alt="" className="w-5 h-5" />
                      <span>{l.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cabecera de lotería - PROMINENTE */}
        <div className="flex items-center gap-4 py-4 px-5 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl border-2 border-primary/30">
          <img src={getLotteryLogo(selectedLottery)} alt="" className="w-14 h-14 drop-shadow-lg" />
          <div>
            <p className="font-black text-xl text-foreground">{selectedLotteryData?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedDate} · Horario: {selectedLotteryData?.schedule === 'half' ? '8:30 AM - 7:30 PM' : '8:00 AM - 7:00 PM'}
            </p>
          </div>
        </div>

        {/* Tabla tipo Excel con RichAnimalCard */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold border-b">HORA</th>
                  <th className="px-4 py-3 text-center text-xs font-bold border-b">RESULTADO</th>
                  {isAdmin && <th className="px-4 py-3 text-center text-xs font-bold border-b">ACCIONES</th>}
                </tr>
              </thead>
              <tbody>
                {availableTimes.map((time, idx) => {
                  const result = resultsByTime[time];
                  const hasResult = !!result;
                  
                  return (
                    <tr 
                      key={time} 
                      className={`border-b last:border-0 transition-colors ${
                        idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      } ${hasResult ? '' : 'opacity-50'}`}
                    >
                      <td className="px-4 py-3 font-medium text-sm">{time}</td>
                      <td className="px-4 py-3">
                        {editingId === result?.id ? (
                          <Input
                            value={editNumber}
                            onChange={(e) => setEditNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                            className="h-8 w-16 text-center font-mono font-bold mx-auto"
                            maxLength={2}
                          />
                        ) : hasResult ? (
                          <div className="flex justify-center">
                            <RichAnimalCard
                              code={result.result_number}
                              size="sm"
                              showProbability={false}
                              onClick={() => setSelectedResult(result)}
                              className="cursor-pointer hover:ring-2 hover:ring-primary"
                            />
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm">
                            Sin resultado
                          </div>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          {hasResult && (
                            editingId === result.id ? (
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
                                <Button size="sm" variant="ghost" onClick={() => startEdit(result)} className="h-7 w-7 p-0" title="Editar">
                                  <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => confirmDelete(result.id)} className="h-7 w-7 p-0" title="Eliminar">
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </div>
                            )
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Resumen */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Total registrados: {results.length} de {availableTimes.length} sorteos</span>
          {isAdmin && <span className="text-primary">✏️ Click en el ícono del lápiz para editar</span>}
        </div>
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

      {/* Detail dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={getLotteryLogo(selectedResult?.lottery_type || '')} alt="" className="w-8 h-8" />
              {selectedLotteryData?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="flex flex-col items-center gap-4 py-4">
              <RichAnimalCard
                code={selectedResult.result_number}
                size="lg"
                showProbability={false}
                lotteryName={selectedLotteryData?.name}
              />
              <div className="text-center text-sm text-muted-foreground">
                <p>Hora: {selectedResult.draw_time}</p>
                <p>Fecha: {selectedResult.draw_date}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
