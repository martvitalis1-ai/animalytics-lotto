import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, Gift, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES } from '@/lib/constants';
import { getAnimalName, getAnimalEmoji } from '@/lib/animalData';

const ANIMAL_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const code = i === 0 ? '00' : i.toString();
  const name = getAnimalName(code) || `Animal ${code}`;
  return { code, name, emoji: getAnimalEmoji(code) };
});
ANIMAL_OPTIONS.unshift({ code: '0', name: getAnimalName('0') || 'Delfín', emoji: getAnimalEmoji('0') });

const getPickTypeFromNotes = (notes?: string | null): 'explosivo' | 'regalo' => {
  if (!notes) return 'explosivo';
  if (notes.startsWith('[REGALO]')) return 'regalo';
  return 'explosivo';
};

const stripPrefix = (notes?: string | null): string => {
  if (!notes) return '';
  return notes.replace(/^\[(EXPLOSIVO|REGALO)\]\s*/i, '');
};

export function AdminManualOverrides() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [pickType, setPickType] = useState<string>('explosivo');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadPicks = useCallback(async () => {
    const { data, error } = await supabase
      .from('dato_ricardo_predictions')
      .select('id, lottery_type, predicted_numbers, predicted_animals, notes, prediction_date, draw_time, created_at')
      .eq('prediction_date', today)
      .eq('draw_time', 'MANUAL')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setPicks([]);
      return;
    }

    const normalized = (data || []).flatMap((row: any) => {
      const code = row?.predicted_numbers?.[0];
      if (!code) return [];
      return [{
        id: row.id,
        lottery_type: row.lottery_type,
        animal_code: code,
        animal_name: row?.predicted_animals?.[0] || getAnimalName(code),
        pick_type: getPickTypeFromNotes(row.notes),
        notes: stripPrefix(row.notes),
      }];
    });

    setPicks(normalized);
  }, [today]);

  useEffect(() => { loadPicks(); }, [loadPicks]);

  const handleAdd = async () => {
    if (!selectedAnimal) {
      toast.error("Selecciona un animal");
      return;
    }

    setLoading(true);
    const animalName = getAnimalName(selectedAnimal) || '';
    const prefix = pickType === 'regalo' ? '[REGALO]' : '[EXPLOSIVO]';
    const mergedNotes = `${prefix}${notes ? ` ${notes}` : ''}`;

    const { error } = await supabase.from('dato_ricardo_predictions').insert({
      lottery_type: selectedLottery,
      draw_time: 'MANUAL',
      prediction_date: today,
      predicted_numbers: [selectedAnimal],
      predicted_animals: [animalName],
      notes: mergedNotes,
    });

    if (error) {
      toast.error("Error al guardar en dato_ricardo_predictions");
      console.error(error);
    } else {
      toast.success(`${pickType === 'explosivo' ? '💥 Explosivo' : '🎁 Regalo'} agregado con éxito`);
      setSelectedAnimal('');
      setNotes('');
      loadPicks();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from('dato_ricardo_predictions').delete().eq('id', id);
    if (!error) {
      toast.success("Eliminado del registro");
      loadPicks();
    }
  };

  const explosivos = picks.filter(p => p.pick_type === 'explosivo');
  const regalos = picks.filter(p => p.pick_type === 'regalo');

  return (
    <Card className="glass-card border-2 border-destructive/30 shadow-xl animate-in fade-in duration-500">
      <CardHeader className="pb-3 bg-destructive/5 border-b">
        <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tighter">
          <Flame className="w-6 h-6 text-destructive animate-pulse" />
          Control Manual: Explosivos y Regalos
        </CardTitle>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Guarda manuales en dato_ricardo_predictions
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-muted/20 p-4 rounded-2xl border border-dashed border-primary/20">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Lotería</label>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="bg-background font-bold"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-2 shadow-2xl">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id} className="font-bold">{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Tipo de Dato</label>
            <Select value={pickType} onValueChange={(v) => setPickType(v as any)}>
              <SelectTrigger className="bg-background font-bold"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-2 shadow-2xl">
                <SelectItem value="explosivo" className="font-bold text-red-600">💥 Explosivo</SelectItem>
                <SelectItem value="regalo" className="font-bold text-emerald-600">🎁 Regalo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Elegir Animal</label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger className="bg-background font-bold"><SelectValue placeholder="Animal..." /></SelectTrigger>
              <SelectContent className="bg-popover border-2 shadow-2xl max-h-80">
                {ANIMAL_OPTIONS.map(a => (
                  <SelectItem key={a.code} value={a.code} className="font-bold text-sm">
                    {a.emoji} {a.code.padStart(2, '0')} - {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-muted-foreground">Nota Maliciosa</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional..."
              className="bg-background font-bold"
            />
          </div>

          <Button onClick={handleAdd} disabled={loading} className="bg-destructive hover:bg-destructive/90 h-10 font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5 mr-1" />}
            Agregar
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3 p-4 bg-red-500/5 rounded-3xl border-2 border-red-500/10">
            <h4 className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter text-red-600">
              <Flame className="w-5 h-5" /> Explosivos Activos ({explosivos.length})
            </h4>
            <div className="space-y-2">
              {explosivos.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-bold italic uppercase py-4 text-center">No hay explosivos definidos para hoy</p>
              ) : (
                explosivos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-card border-2 border-red-500/20 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl drop-shadow-sm">{getAnimalEmoji(p.animal_code)}</span>
                      <div>
                        <p className="font-mono font-black text-lg leading-none">{String(p.animal_code).padStart(2, '0')}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{p.animal_name}</p>
                        <p className="text-[8px] font-bold text-primary">{LOTTERIES.find(l => l.id === p.lottery_type)?.name}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-emerald-500/5 rounded-3xl border-2 border-emerald-500/10">
            <h4 className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter text-emerald-600">
              <Gift className="w-5 h-5" /> Regalos del Jefe ({regalos.length})
            </h4>
            <div className="space-y-2">
              {regalos.length === 0 ? (
                <p className="text-[10px] text-muted-foreground font-bold italic uppercase py-4 text-center">No hay regalos definidos para hoy</p>
              ) : (
                regalos.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-card border-2 border-emerald-500/20 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl drop-shadow-sm">{getAnimalEmoji(p.animal_code)}</span>
                      <div>
                        <p className="font-mono font-black text-lg leading-none">{String(p.animal_code).padStart(2, '0')}</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{p.animal_name}</p>
                        <p className="text-[8px] font-bold text-primary">{LOTTERIES.find(l => l.id === p.lottery_type)?.name}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
