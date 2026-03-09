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
    if (!nombre || !whatsapp) return toast.error("Mínimo Nombre y WhatsApp");
    setLoading(true);
    try {
      let publicUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('logos_agencias').upload(fileName, file);
        if (!uploadError) {
          const { data: linkData } = supabase.storage.from('logos_agencias').getPublicUrl(fileName);
          publicUrl = linkData.publicUrl;
        }
      }

      await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp,
        banco_nombre: banco.toUpperCase(),
        banco_cedula: cedula,
        banco_telefono: telefonoBanco,
        logo_url: publicUrl
      });
      toast.success("Agencia guardada");
      setNombre(""); setWhatsapp(""); setBanco(""); setCedula(""); setTelefonoBanco(""); setFile(null);
      fetchAgencias();
    } catch (e) { toast.error("Error"); }
    finally { setLoading(false); }
  };

  return (
    <Card className="glass-card border-2 border-primary/20">
      <CardHeader><CardTitle className="text-sm font-black uppercase italic flex items-center gap-2"><Store className="w-5 h-5" /> Configurar Agencias</CardTitle></CardHeader>
      <CardContent className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Agencia" />
            <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp (58...)" />
            <Input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Banco (PM)" />
            <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula (PM)" />
            <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono (PM)" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full font-black uppercase italic">{loading ? <Loader2 className="animate-spin" /> : "Registrar Agencia"}</Button>
        <div className="space-y-2 pt-4">
          {agencias.map(ag => (
            <div key={ag.id} className="p-3 bg-muted/50 rounded-xl border flex justify-between items-center">
              <div className="flex items-center gap-2">
                {ag.logo_url && <img src={ag.logo_url} className="w-8 h-8 rounded-full object-cover border" />}
                <p className="font-black text-xs uppercase">{ag.nombre}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={async () => { await supabase.from('agencias').delete().eq('id', ag.id); fetchAgencias(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
