import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Store } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const fetchAgencias = async () => {
    try {
      const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
      if (data) setAgencias(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleSave = async () => {
    if (!nombre || !whatsapp) return toast.error("Faltan datos");
    setLoading(true);
    try {
      const { error } = await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp: whatsapp.trim() 
      });
      if (error) throw error;
      toast.success("Agencia registrada");
      setNombre(""); setWhatsapp("");
      fetchAgencias();
    } catch (e) {
      toast.error("Error al guardar agencia");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgencia = async (id: string) => {
    try {
      await supabase.from('agencias').delete().eq('id', id);
      fetchAgencias();
      toast.success("Eliminada");
    } catch (e) { toast.error("Error al borrar"); }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" /> Gestión de Agencias Aliadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-1">Nombre de la Agencia</label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: INVERSIONES GANADOR" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase ml-1">WhatsApp (Ej: 584121234567)</label>
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="Solo números" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black uppercase italic">
          {loading ? <Loader2 className="animate-spin" /> : "Registrar Nueva Agencia"}
        </Button>
        <div className="pt-4 grid grid-cols-1 gap-2">
          {agencias.map(ag => (
            <div key={ag.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border shadow-sm">
              <div className="text-left">
                <p className="font-black text-xs uppercase text-primary">{ag.nombre}</p>
                <p className="text-[10px] font-bold text-muted-foreground">{ag.whatsapp}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteAgencia(ag.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
