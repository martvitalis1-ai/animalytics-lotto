import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Store, Landmark } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  // Nuevos estados para datos bancarios
  const [banco, setBanco] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefonoBanco, setTelefonoBanco] = useState("");

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleSave = async () => {
    if (!nombre || !whatsapp || !banco) return toast.error("Mínimo: Nombre, WhatsApp y Banco");
    setLoading(true);
    const { error } = await supabase.from('agencias').insert({ 
      nombre: nombre.toUpperCase(), 
      whatsapp,
      banco_nombre: banco,
      banco_cedula: cedula,
      banco_telefono: telefonoBanco
    });

    if (!error) {
      toast.success("Agencia y datos bancarios guardados");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco("");
      fetchAgencias();
    }
    setLoading(false);
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Store className="w-5 h-5" /> Configurar Agencias y Pagos</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b">Datos de Contacto</p>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Agencia" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (58...)" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b">Datos de Cobro (Pago Móvil)</p>
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Banco (Ej: Banesco)" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula/RIF" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono Pago Móvil" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black italic uppercase">
          {loading ? <Loader2 className="animate-spin" /> : <Plus className="mr-2" />} Registrar Agencia
        </Button>
        <div className="space-y-2">
          {agencias.map(ag => (
            <div key={ag.id} className="p-3 bg-muted/50 rounded-xl border flex justify-between items-center text-left">
              <div>
                <p className="font-black text-xs">{ag.nombre}</p>
                <p className="text-[9px] opacity-70">PM: {ag.banco_nombre} | {ag.banco_cedula}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await supabase.from('agencias').delete().eq('id', ag.id); fetchAgencias(); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
