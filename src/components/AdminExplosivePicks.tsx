import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Flame, Gift, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LOTTERIES } from '@/lib/constants';
import { getAnimalMappingForLottery, getAnimalName } from '@/lib/animalData';
import { getLotteryLogo } from './LotterySelector';

export function AdminExplosivePicks() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lotteryType, setLotteryType] = useState('lotto_activo');
  const [pickType, setPickType] = useState<'explosivo' | 'regalo'>('explosivo');
  const [animalCode, setAnimalCode] = useState('');
  const [notes, setNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const loadPicks = async () => {
    const { data } = await supabase
      .from('admin_picks')
      .select('*')
      .eq('pick_date', today)
      .order('created_at', { ascending: false });
    setPicks(data || []);
  };

  useEffect(() => { loadPicks(); }, []);

  const handleAdd = async () => {
    if (!animalCode.trim()) { toast.error("Selecciona un animal"); return; }
    setLoading(true);
    const name = getAnimalName(animalCode, lotteryType);
    const { error } = await supabase.from('admin_picks').insert({
      lottery_type: lotteryType,
      pick_type: pickType,
      animal_code: animalCode,
      animal_name: name,
      notes: notes || null,
      pick_date: today,
    });
    if (error) { toast.error("Error al guardar"); }
    else { toast.success("Pick guardado"); setAnimalCode(''); setNotes(''); loadPicks(); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('admin_picks').delete().eq('id', id);
    toast.success("Eliminado");
    loadPicks();
  };

  const mapping = getAnimalMappingForLottery(lotteryType);
  const animalOptions = Object.entries(mapping).sort((a, b) => {
    if (a[0] === '00') return 1;
    if (b[0] === '00') return -1;
    return parseInt(a[0]) - parseInt(b[0]);
  });

  const explosivos = picks.filter(p => p.pick_type === 'explosivo');
  const regalos = picks.filter(p => p.pick_type === 'regalo');

  return (
    <Card className="glass-card border-2 border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Flame className="w-5 h-5 text-destructive" />
          Control de Explosivos y Regalos
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Asigna manualmente los animales explosivos y de regalo para hoy
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={lotteryType} onValueChange={setLotteryType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              {LOTTERIES.map(l => (
                <SelectItem key={l.id} value={l.id}>
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(l.id)} alt="" className="w-4 h-4" />
                    {l.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={pickType} onValueChange={(v) => setPickType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg">
              <SelectItem value="explosivo">🔥 Explosivo</SelectItem>
              <SelectItem value="regalo">🎁 Regalo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={animalCode} onValueChange={setAnimalCode}>
            <SelectTrigger><SelectValue placeholder="Animal..." /></SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg max-h-60">
              {animalOptions.map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {code.padStart(2, '0')} - {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleAdd} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Agregar</>}
          </Button>
        </div>

        <Input placeholder="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)} />

        {/* Current picks */}
        {explosivos.length > 0 && (
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1 mb-2"><Flame className="w-4 h-4 text-destructive" /> Explosivos Hoy</h4>
            <div className="space-y-1">
              {explosivos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(p.lottery_type)} alt="" className="w-5 h-5" />
                    <span className="font-mono font-bold">{p.animal_code.padStart(2, '0')}</span>
                    <span className="text-sm">{p.animal_name}</span>
                    {p.notes && <span className="text-xs text-muted-foreground italic">({p.notes})</span>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-7 w-7 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {regalos.length > 0 && (
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1 mb-2"><Gift className="w-4 h-4 text-amber-500" /> Regalos Hoy</h4>
            <div className="space-y-1">
              {regalos.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-amber-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={getLotteryLogo(p.lottery_type)} alt="" className="w-5 h-5" />
                    <span className="font-mono font-bold">{p.animal_code.padStart(2, '0')}</span>
                    <span className="text-sm">{p.animal_name}</span>
                    {p.notes && <span className="text-xs text-muted-foreground italic">({p.notes})</span>}
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)} className="h-7 w-7 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {picks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">No hay picks asignados para hoy</p>
        )}
      </CardContent>
    </Card>
  );
}
