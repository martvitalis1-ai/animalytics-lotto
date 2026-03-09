import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Store, Upload, Image as ImageIcon } from "lucide-react";
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
    if (!nombre || !whatsapp || !banco) return toast.error("Faltan datos");
    setLoading(true);
    try {
      let publicUrl = null;

      // Lógica para subir el LOGO al Storage
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
        whatsapp: whatsapp.trim(),
        banco_nombre: banco.toUpperCase(),
        banco_cedula: cedula.trim(),
        banco_telefono: telefonoBanco.trim(),
        logo_url: publicUrl
      });

      if (error) throw error;
      toast.success("Agencia y Logo registrados");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco(""); setFile(null);
      fetchAgencias();
    } catch (e) {
      toast.error("Error al guardar: Asegúrate de crear el bucket 'logos_agencias' en Storage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Store className="w-5 h-5" /> Registro de Agencias con Logo</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-primary uppercase border-b pb-1">1. Contacto y Logo</p>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Agencia" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (58...)" />
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-[10px]" />
              <ImageIcon className="text-muted-foreground w-5 h-5" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-emerald-600 uppercase border-b pb-1">2. Pago Móvil de Agencia</p>
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Banco" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula/RIF" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono Pago Móvil" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black italic uppercase">
          {loading ? <Loader2 className="animate-spin" /> : <Plus className="mr-2" />} Guardar Agencia Aliada
        </Button>
        <div className="pt-4 grid grid-cols-1 gap-2">
          {agencias.map(ag => (
            <div key={ag.id} className="p-3 bg-card border rounded-2xl flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3">
                {ag.logo_url ? <img src={ag.logo_url} className="w-10 h-10 rounded-lg object-cover border" /> : <div className="w-10 h-10 bg-muted rounded-lg" />}
                <div className="text-left">
                  <p className="font-black text-xs uppercase">{ag.nombre}</p>
                  <p className="text-[9px] opacity-60 font-bold">{ag.whatsapp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await supabase.from('agencias').delete().eq('id', ag.id); fetchAgencias(); }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
