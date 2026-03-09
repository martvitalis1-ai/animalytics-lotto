import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleSave = async () => {
    if (!nombre || !whatsapp) return toast.error("Faltan datos");
    setLoading(true);
    const { error } = await supabase.from('agencias').insert({ nombre, whatsapp });
    if (error) toast.error("Error al guardar");
    else {
      toast.success("Agencia agregada");
      setNombre(""); setWhatsapp("");
      fetchAgencias();
    }
    setLoading(false);
  };

  const deleteAgencia = async (id: string) => {
    await supabase.from('agencias').delete().eq('id', id);
    fetchAgencias();
    toast.success("Eliminada");
  };

  return (
    <Card className="glass-card">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic">Gestionar Agencias de Loteria</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-1">Nombre Comercial</label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Loteria El Ganador" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-1">WhatsApp (Con código de país)</label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Ej: 584121234567" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-bold">
          {loading ? <Loader2 className="animate-spin" /> : <Plus className="mr-2 h-4 w-4" />} REGISTRAR AGENCIA
        </Button>
        <div className="pt-4 space-y-2">
          {agencias.map(ag => (
            <div key={ag.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
              <div className="text-left">
                <p className="font-black text-xs uppercase">{ag.nombre}</p>
                <p className="text-[10px] text-muted-foreground">{ag.whatsapp}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteAgencia(ag.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
