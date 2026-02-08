import { useState, useEffect, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Printer, Clock, Calendar, Hash, Trophy, Trash2, Pencil, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getAnimalEmoji, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { LOTTERIES } from '@/lib/constants';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface TicketEntry {
  id?: string;
  number: string;
  animalName: string;
  animalEmoji: string;
  amount?: number;
}

interface ThermalTicketProps {
  id: string;
  lotteryType: string;
  drawTime: string;
  drawDate: string;
  entries: TicketEntry[];
  notes?: string;
  userCode: string;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export function ThermalTicket({
  id,
  lotteryType,
  drawTime,
  drawDate,
  entries,
  notes,
  userCode,
  onDelete,
  onUpdate
}: ThermalTicketProps) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TicketEntry | null>(null);
  const [editNumber, setEditNumber] = useState('');
  const [deleting, setDeleting] = useState(false);

  const lottery = LOTTERIES.find(l => l.id === lotteryType);

  // Load results to check hits
  useEffect(() => {
    const loadResults = async () => {
      const { data } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_type', lotteryType)
        .eq('draw_date', drawDate)
        .eq('draw_time', drawTime);
      
      setResults(data || []);
      setLoading(false);
    };
    
    loadResults();
    
    // Subscribe to realtime
    const channel = supabase
      .channel(`ticket-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lottery_results',
        filter: `lottery_type=eq.${lotteryType}`
      }, () => {
        loadResults();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, lotteryType, drawDate, drawTime]);

  // Check which entries hit
  const entriesWithStatus = useMemo(() => {
    return entries.map(entry => {
      const hit = results.some(r => {
        const resultNum = r.result_number?.toString().trim();
        const entryNum = entry.number.trim();
        return resultNum === entryNum || 
               parseInt(resultNum) === parseInt(entryNum);
      });
      return { ...entry, hit };
    });
  }, [entries, results]);

  const hasAnyHit = entriesWithStatus.some(e => e.hit);
  const resultKnown = results.length > 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-VE', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const handleDeleteTicket = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      // Delete all entries for this ticket group
      const { error } = await supabase
        .from('user_tracking_logs')
        .delete()
        .eq('lottery_type', lotteryType)
        .eq('draw_date', drawDate)
        .eq('draw_time', drawTime)
        .eq('user_code', userCode);

      if (error) throw error;
      
      toast.success('Ticket eliminado');
      onDelete(id);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar');
    }
    setDeleting(false);
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('user_tracking_logs')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
      
      toast.success('Jugada eliminada');
      onUpdate?.();
    } catch (error) {
      console.error('Delete entry error:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleEditEntry = (entry: TicketEntry) => {
    setEditingEntry(entry);
    setEditNumber(entry.number);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry?.id || !editNumber) return;
    
    try {
      const animalName = getAnimalName(editNumber);
      
      const { error } = await supabase
        .from('user_tracking_logs')
        .update({
          selected_number: editNumber,
          animal_name: animalName
        })
        .eq('id', editingEntry.id);

      if (error) throw error;
      
      toast.success('Jugada actualizada');
      setEditMode(false);
      setEditingEntry(null);
      onUpdate?.();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error al actualizar');
    }
  };

  return (
    <>
      <Card className={`
        relative overflow-hidden border-2 transition-all
        ${hasAnyHit 
          ? 'border-green-500 bg-green-500/5 shadow-lg shadow-green-500/20' 
          : resultKnown 
            ? 'border-muted-foreground/30 opacity-70' 
            : 'border-dashed border-muted-foreground/50'
        }
      `}>
        {/* Thermal printer effect - dashed top edge */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-background to-transparent" />
        <div className="border-b-2 border-dashed border-muted-foreground/30" />
        
        {/* Header */}
        <div className="p-3 text-center border-b border-dashed border-muted-foreground/30">
          <div className="flex items-center justify-center gap-2 mb-1">
            <img src={getLotteryLogo(lotteryType)} alt="" className="w-6 h-6" />
            <span className="font-mono font-bold text-sm uppercase tracking-wider">
              {lottery?.name || lotteryType}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(drawDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {drawTime}
            </span>
          </div>
          
          <div className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
            #{id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Entries */}
        <div className="p-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground text-center mb-2">
            ═══════ MIS JUGADAS ═══════
          </div>
          
          {entriesWithStatus.map((entry, idx) => (
            <div 
              key={entry.id || idx}
              className={`
                flex items-center justify-between p-2 rounded font-mono text-sm
                transition-all duration-300
                ${entry.hit 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-muted/50'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{entry.animalEmoji}</span>
                <div>
                  <span className={`font-bold text-lg ${entry.hit ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {entry.number.padStart(2, '0')}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {entry.animalName}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {entry.amount && (
                  <span className="text-xs text-muted-foreground">
                    Bs. {entry.amount}
                  </span>
                )}
                
                {/* Edit/Delete buttons */}
                {!resultKnown && entry.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteEntry(entry.id!)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                )}
                
                {resultKnown && (
                  entry.hit ? (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-5 h-5" />
                      <Trophy className="w-4 h-4" />
                    </div>
                  ) : (
                    <X className="w-5 h-5 text-muted-foreground" />
                  )
                )}
                {!resultKnown && !entry.id && (
                  <span className="text-[10px] text-muted-foreground animate-pulse">
                    Pendiente...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {notes && (
          <div className="px-3 py-2 border-t border-dashed border-muted-foreground/30">
            <p className="text-xs text-muted-foreground italic font-mono">
              📝 {notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-dashed border-muted-foreground/30 text-center">
          <div className="text-[10px] text-muted-foreground font-mono space-y-1">
            <div>ANIMALYTICS PRO</div>
            <div className="flex items-center justify-center gap-1">
              <Hash className="w-3 h-3" />
              Usuario: {userCode}
            </div>
          </div>
          
          {/* Winner banner */}
          {hasAnyHit && (
            <div className="mt-2 py-2 bg-green-500 text-white font-bold text-sm rounded animate-pulse">
              🎉 ¡GANADOR! 🎉
            </div>
          )}
        </div>

        {/* Thermal printer effect - dashed bottom edge */}
        <div className="border-t-2 border-dashed border-muted-foreground/30" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-background to-transparent" />

        {/* Delete Ticket Button */}
        {onDelete && !resultKnown && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 bg-destructive/80 hover:bg-destructive text-destructive-foreground"
              onClick={handleDeleteTicket}
              disabled={deleting}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Jugada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getAnimalEmoji(editNumber)}</span>
              <div className="flex-1">
                <Input
                  type="text"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="00-99"
                  className="font-mono text-xl text-center"
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {getAnimalName(editNumber)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Ticket grid for multiple tickets
interface ThermalTicketGridProps {
  tickets: Array<{
    id: string;
    lottery_type: string;
    draw_time: string;
    draw_date: string;
    selected_number: string;
    animal_name: string;
    notes?: string;
    user_code: string;
  }>;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export function ThermalTicketGrid({ tickets, onDelete, onUpdate }: ThermalTicketGridProps) {
  // Group tickets by lottery+date+time
  const groupedTickets = useMemo(() => {
    const groups: Record<string, typeof tickets> = {};
    
    tickets.forEach(ticket => {
      const key = `${ticket.lottery_type}-${ticket.draw_date}-${ticket.draw_time}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(ticket);
    });
    
    return groups;
  }, [tickets]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(groupedTickets).map(([key, group]) => {
        const first = group[0];
        const entries: TicketEntry[] = group.map(t => ({
          id: t.id,
          number: t.selected_number,
          animalName: t.animal_name || getAnimalName(t.selected_number),
          animalEmoji: getAnimalEmoji(t.selected_number)
        }));

        return (
          <ThermalTicket
            key={key}
            id={first.id}
            lotteryType={first.lottery_type}
            drawTime={first.draw_time}
            drawDate={first.draw_date}
            entries={entries}
            notes={first.notes}
            userCode={first.user_code}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        );
      })}
    </div>
  );
}
