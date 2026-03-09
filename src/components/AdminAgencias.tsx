import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Loader2, Store, Upload } from "lucide-react";
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
    if (!nombre || !whatsapp || !banco) return toast.error("Completa los datos básicos");
    setLoading(true);
    try {
      let publicUrl = null;
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('logos_agencias').upload(fileName, file);
        if (!uploadError) {
          const { data } = supabase.storage.from('logos_agencias').getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        }
      }

      const { error } = await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp: whatsapp.trim(), // Aquí pones el número o el link
        banco_nombre: banco.toUpperCase(), 
        banco_cedula: cedula, 
        banco_telefono: telefonoBanco, 
        logo_url: publicUrl
      });
      if (error) throw error;
      toast.success("Agencia registrada");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco(""); setFile(null);
      fetchAgencias();
    } catch (e) { toast.error("Error al guardar"); }
    finally { setLoading(false); }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Store className="w-5 h-5" /> GESTIÓN DE AGENCIAS</CardTitle></CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase">1. Info de Contacto</label>
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Agencia" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (Ej: 584121234567)" />
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase">Logo de Agencia</label>
              <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-[10px] cursor-pointer" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase">2. Pago Móvil Agencia</label>
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Nombre del Banco" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula/RIF" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black uppercase italic">{loading ? <Loader2 className="animate-spin" /> : "Registrar Agencia"}</Button>
        <div className="space-y-2 pt-4">
          {agencias.map(ag => (
            <div key={ag.id} className="p-3 bg-muted/50 rounded-xl border flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-3 text-left">
                {ag.logo_url && <img src={ag.logo_url} className="w-10 h-10 rounded-full object-cover border" />}
                <div>
                  <p className="font-black text-xs uppercase">{ag.nombre}</p>
                  <p className="text-[9px] opacity-70 italic">{ag.whatsapp}</p>
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
