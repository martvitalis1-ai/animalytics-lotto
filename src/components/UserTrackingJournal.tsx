import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Trash2, 
  Calendar, 
  Clock, 
  Save,
  Loader2,
  History,
  Ticket,
  Sparkles,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES, getDrawTimesForLottery } from '@/lib/constants';
import { getLotteryLogo } from './LotterySelector';
import { getAnimalName, getAnimalEmoji, getMaxNumberForLottery } from '@/lib/animalData';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThermalTicketGrid } from './ThermalTicket';

interface TrackingLog {
  id: string;
  user_code: string;
  lottery_type: string;
  draw_time: string;
  draw_date: string;
  selected_number: string;
  animal_name: string | null;
  notes: string | null;
  created_at: string;
}

interface UserTrackingJournalProps {
  userCode?: string;
}

export function UserTrackingJournal({ userCode = 'anonymous' }: UserTrackingJournalProps) {
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedLottery, setSelectedLottery] = useState<string>('lotto_activo');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const lottery = LOTTERIES.find(l => l.id === selectedLottery);
  const drawTimes = getDrawTimesForLottery(selectedLottery);
  const maxNumber = getMaxNumberForLottery(selectedLottery);

  // Get animal info for preview
  const previewAnimalName = selectedNumber ? getAnimalName(selectedNumber, selectedLottery) : '';
  const previewAnimalEmoji = selectedNumber ? getAnimalEmoji(selectedNumber) : '';

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_tracking_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as TrackingLog[]) || []);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Error al cargar el historial');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Set default time to next draw
  useEffect(() => {
    if (drawTimes.length > 0 && !selectedTime) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      for (const time of drawTimes) {
        const match = time.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          let hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          const ampm = match[3].toUpperCase();

          if (ampm === 'PM' && hours !== 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;

          const drawMinutes = hours * 60 + minutes;
          if (drawMinutes > currentMinutes) {
            setSelectedTime(time);
            return;
          }
        }
      }
      setSelectedTime(drawTimes[0]);
    }
  }, [drawTimes, selectedTime]);

  const handleNumberChange = (value: string) => {
    // Only allow valid numbers for the lottery
    const cleaned = value.replace(/\D/g, '');
    if (cleaned === '' || cleaned === '0' || cleaned === '00') {
      setSelectedNumber(cleaned);
      return;
    }
    const num = parseInt(cleaned);
    if (!isNaN(num) && num <= maxNumber) {
      setSelectedNumber(cleaned);
    }
  };

  const handleSave = async () => {
    if (!selectedNumber || !selectedTime || !selectedDate || !selectedLottery) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const animalName = getAnimalName(selectedNumber, selectedLottery);

      const { error } = await supabase
        .from('user_tracking_logs')
        .insert({
          user_code: userCode,
          lottery_type: selectedLottery,
          draw_time: selectedTime,
          draw_date: selectedDate,
          selected_number: selectedNumber,
          animal_name: animalName || null,
          notes: notes || null,
        });

      if (error) throw error;

      toast.success(`✅ Registrado: ${selectedNumber} - ${animalName}`);
      setSelectedNumber('');
      setNotes('');
      loadLogs();
    } catch (error) {
      console.error('Error saving log:', error);
      toast.error('Error al guardar el registro');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_tracking_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Registro eliminado');
      loadLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Error al eliminar');
    }
  };

  // Ticket Digital Dinámico Design
  const TicketPreview = () => {
    if (!selectedNumber) return null;
    
    return (
      <div className="relative p-4 bg-gradient-to-br from-primary/20 via-background to-accent/20 rounded-xl border-2 border-primary/50 shadow-lg animate-in fade-in zoom-in">
        {/* Ticket Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-primary/30">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">TICKET DE SEGUIMIENTO</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        
        {/* Main Content */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-5xl">{previewAnimalEmoji}</span>
          <div className="text-center">
            <span className="font-mono font-black text-4xl text-primary block">
              {selectedNumber === '0' ? '0' : selectedNumber === '00' ? '00' : selectedNumber.padStart(2, '0')}
            </span>
            <span className="text-lg font-bold uppercase tracking-wide">{previewAnimalName}</span>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-dashed border-primary/30 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <img src={getLotteryLogo(selectedLottery)} alt="" className="w-4 h-4" />
            <span>{lottery?.name}</span>
          </div>
          <span>{selectedTime}</span>
        </div>
        
        {/* Decorative corner cuts */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-background rounded-full border border-primary/30" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-background rounded-full border border-primary/30" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-background rounded-full border border-primary/30" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-background rounded-full border border-primary/30" />
      </div>
    );
  };

  return (
    <Card className="glass-card border-2 border-primary/30 overflow-hidden">
      {/* Decorative header stripe */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/70">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          Mi Seguimiento
          <Sparkles className="w-4 h-4 text-amber-500 ml-auto" />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Ticket Digital Dinámico • Registra y analiza tus selecciones
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="grid gap-3 p-4 bg-muted/30 rounded-xl border">
          <div className="grid grid-cols-2 gap-3">
            {/* Lottery Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sorteo</label>
              <Select value={selectedLottery} onValueChange={setSelectedLottery}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg">
                  {LOTTERIES.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      <div className="flex items-center gap-2">
                        <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4" />
                        <span className="truncate">{l.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hora</label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Seleccionar hora" />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg">
                  {drawTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Date Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            {/* Number Input with instant preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Número (0-{maxNumber})
              </label>
              <Input
                type="text"
                value={selectedNumber}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder="Ej: 28"
                className="font-mono font-bold text-center text-xl bg-background"
                maxLength={2}
              />
            </div>
          </div>

          {/* Ticket Digital Preview */}
          <TicketPreview />

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notas (opcional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Razón, intuición, patrón..."
              className="bg-background"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving || !selectedNumber}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Guardar Selección
          </Button>
        </div>

        {/* History - Thermal Ticket Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Printer className="w-4 h-4" />
            Mis Tickets Digitales
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No hay tickets aún</p>
              <p className="text-xs">Registra tus selecciones para ver los tickets</p>
            </div>
          ) : (
            <ThermalTicketGrid 
              tickets={logs} 
              onDelete={handleDelete}
              onUpdate={loadLogs}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
