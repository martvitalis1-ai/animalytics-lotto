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
  // Estados para datos bancarios de la agencia
  const [banco, setBanco] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefonoBanco, setTelefonoBanco] = useState("");

  const fetchAgencias = async () => {
    try {
      const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
      if (data) setAgencias(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleSave = async () => {
    if (!nombre || !whatsapp || !banco || !cedula || !telefonoBanco) {
      return toast.error("Por favor completa todos los datos (Nombre, WhatsApp y Pago Móvil)");
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp: whatsapp.trim(),
        banco_nombre: banco.toUpperCase(),
        banco_cedula: cedula.trim(),
        banco_telefono: telefonoBanco.trim()
      });

      if (error) throw error;
      
      toast.success("Agencia y datos bancarios registrados");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco("");
      fetchAgencias();
    } catch (e) {
      toast.error("Error al guardar la agencia");
    } finally {
      setLoading(false);
    }
  };

  const deleteAgencia = async (id: string) => {
    await supabase.from('agencias').delete().eq('id', id);
    fetchAgencias();
    toast.success("Agencia eliminada");
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase italic flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" /> Configuración de Agencias y Pagos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Datos de Contacto */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-primary/10 pb-1">1. Datos de Contacto</p>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Comercial" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (Ej: 58412...)" />
          </div>
          
          {/* Datos de Cobro */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-emerald-600/10 pb-1">2. Datos de Pago Móvil (Agencia)</p>
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Nombre del Banco (Ej: Banesco)" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula o RIF" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono del Pago Móvil" />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full font-black uppercase italic shadow-lg">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />} Registrar Agencia Aliada
        </Button>

        <div className="pt-4 grid grid-cols-1 gap-2">
          {agencias.map(ag => (
            <div key={ag.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex justify-between items-center shadow-sm">
              <div className="text-left space-y-1">
                <p className="font-black text-xs uppercase text-primary">{ag.nombre}</p>
                <div className="flex gap-3 text-[9px] font-bold opacity-70 uppercase">
                  <span>🏦 {ag.banco_nombre}</span>
                  <span>🆔 {ag.banco_cedula}</span>
                  <span>📞 {ag.whatsapp}</span>
                </div>
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
