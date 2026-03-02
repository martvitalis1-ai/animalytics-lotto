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

// Generate full animal list 00-99
const ANIMAL_OPTIONS = Array.from({ length: 100 }, (_, i) => {
  const code = i === 0 ? '00' : i.toString();
  const name = getAnimalName(code) || `Animal ${code}`;
  return { code, name, emoji: getAnimalEmoji(code) };
});
// Add 0 (Delfín) separately
ANIMAL_OPTIONS.unshift({ code: '0', name: getAnimalName('0') || 'Delfín', emoji: getAnimalEmoji('0') });

export function AdminManualOverrides() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLottery, setSelectedLottery] = useState<string>(LOTTERIES[0].id);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [pickType, setPickType] = useState<string>('explosivo');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadPicks = useCallback(async () => {
    const { data } = await supabase
      .from('admin_picks')
      .select('*')
      .eq('pick_date', today)
      .order('created_at', { ascending: false });
    setPicks(data || []);
  }, [today]);

  useEffect(() => { loadPicks(); }, [loadPicks]);

  const handleAdd = async () => {
    if (!selectedAnimal) {
      toast.error("Selecciona un animal");
      return;
    }
    setLoading(true);
    const animalName = getAnimalName(selectedAnimal) || '';
    
    const { error } = await supabase.from('admin_picks').insert({
      lottery_type: selectedLottery,
      pick_type: pickType,
      animal_code: selectedAnimal,
      animal_name: animalName,
      notes: notes || null,
      pick_date: today
    });

    if (error) {
      toast.error("Error al guardar");
      console.error(error);
    } else {
      toast.success(`${pickType === 'explosivo' ? '💥 Explosivo' : '🎁 Regalo'} agregado: ${selectedAnimal} - ${animalName}`);
      setSelectedAnimal('');
      setNotes('');
      loadPicks();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('admin_picks').delete().eq('id', id);
    toast.success("Eliminado");
    loadPicks();
  };

  const explosivos = picks.filter(p => p.pick_type === 'explosivo');
  const regalos = picks.filter(p => p.pick_type === 'regalo');

  return (
    <Card className="glass-card border-2 border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Flame className="w-5 h-5 text-destructive" />
          Control Manual: Explosivos y Regalos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Los valores definidos aquí se muestran directamente a los usuarios
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Lotería</label>
            <Select value={selectedLottery} onValueChange={setSelectedLottery}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                {LOTTERIES.map(l => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Tipo</label>
            <Select value={pickType} onValueChange={(v) => setPickType(v as any)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg">
                <SelectItem value="explosivo">💥 Explosivo</SelectItem>
                <SelectItem value="regalo">🎁 Regalo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Animal (00-99)</label>
            <Select value={selectedAnimal} onValueChange={setSelectedAnimal}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Elegir..." /></SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg max-h-60">
                {ANIMAL_OPTIONS.map(a => (
                  <SelectItem key={a.code} value={a.code}>
                    {a.emoji} {a.code.padStart(2, '0')} - {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Nota</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional..."
              className="bg-background"
            />
          </div>

          <Button onClick={handleAdd} disabled={loading} className="bg-destructive hover:bg-destructive/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
            Agregar
          </Button>
        </div>

        {/* Current picks */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Explosivos */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500" /> Explosivos Hoy ({explosivos.length})
            </h4>
            {explosivos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Sin explosivos definidos</p>
            ) : (
              explosivos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getAnimalEmoji(p.animal_code)}</span>
                    <span className="font-mono font-bold">{p.animal_code.padStart(2, '0')}</span>
                    <span className="text-sm">{p.animal_name}</span>
                    <span className="text-xs text-muted-foreground">({LOTTERIES.find(l => l.id === p.lottery_type)?.name})</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-7 w-7 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Regalos */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-1">
              <Gift className="w-4 h-4 text-amber-500" /> Regalos Hoy ({regalos.length})
            </h4>
            {regalos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">Sin regalos definidos</p>
            ) : (
              regalos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-amber-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getAnimalEmoji(p.animal_code)}</span>
                    <span className="font-mono font-bold">{p.animal_code.padStart(2, '0')}</span>
                    <span className="text-sm">{p.animal_name}</span>
                    <span className="text-xs text-muted-foreground">({LOTTERIES.find(l => l.id === p.lottery_type)?.name})</span>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-7 w-7 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
