import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Store, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [banco, setBanco] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefonoBanco, setTelefonoBanco] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  useEffect(() => { fetchAgencias(); }, []);

  const handleSave = async () => {
    if (!nombre || !whatsapp || !banco) return toast.error("Nombre, WhatsApp y Banco son obligatorios");
    setLoading(true);
    try {
      let publicUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('logos_agencias').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: linkData } = supabase.storage.from('logos_agencias').getPublicUrl(fileName);
        publicUrl = linkData.publicUrl;
      }

      const { error } = await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp: whatsapp.replace(/\D/g, ''),
        banco_nombre: banco.toUpperCase(),
        banco_cedula: cedula.trim(),
        banco_telefono: telefonoBanco.trim(),
        logo_url: publicUrl
      });

      if (error) throw error;
      toast.success("Agencia registrada con éxito");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco(""); setFile(null);
      fetchAgencias();
    } catch (e) {
      toast.error("Error al guardar. Verifica el bucket 'logos_agencias' en Storage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Store className="w-5 h-5" /> Configurar Agencias y Logos</CardTitle></CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-primary uppercase border-b pb-1">1. Contacto y Logo</p>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Agencia" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (Ej: 58412...)" />
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Logo de la Agencia</label>
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-[10px] cursor-pointer" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase border-b pb-1">2. Pago Móvil Agencia</p>
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Banco (Ej: Banesco)" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula / RIF" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono Pago Móvil" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black italic uppercase shadow-lg">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />} Registrar Agencia Aliada
        </Button>
        <div className="pt-4 grid grid-cols-1 gap-2">
          {agencias.map(ag => (
            <div key={ag.id} className="p-3 bg-muted/30 rounded-xl border flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3 text-left">
                {ag.logo_url ? <img src={ag.logo_url} className="w-10 h-10 rounded-lg object-cover border" /> : <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center"><ImageIcon size={16} className="opacity-20"/></div>}
                <div>
                  <p className="font-black text-xs uppercase text-primary">{ag.nombre}</p>
                  <p className="text-[9px] opacity-60 font-bold italic">📞 {ag.whatsapp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await supabase.from('agencias').delete().eq('id', ag.id); fetchAgencias(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
