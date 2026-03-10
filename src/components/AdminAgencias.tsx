import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Save, Upload, Instagram, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => { fetchAgencias(); }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  const handleUpload = async (e: any, agenciaId: string) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(agenciaId);
    try {
      const fileName = `pub_${agenciaId}_${Date.now()}`;
      await supabase.storage.from('agencias').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      await supabase.from('agencias').update({ publicidad_url: publicUrl }).eq('id', agenciaId);
      toast.success("¡Imagen subida!");
      fetchAgencias();
    } catch (error) { toast.error("Error al subir foto"); }
    finally { setIsUploading(null); }
  };

  const updateAgencia = async (ag: any) => {
    await supabase.from('agencias').update({
      nombre: ag.nombre,
      whatsapp: ag.whatsapp,
      instagram_url: ag.instagram_url,
      banco_nombre: ag.banco_nombre,
      banco_telefono: ag.banco_telefono,
      banco_cedula: ag.banco_cedula
    }).eq('id', ag.id);
    toast.success("¡Datos guardados!");
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      <h1 className="text-3xl font-black uppercase italic border-b-4 border-emerald-500 pb-2">Gestión de Agencias</h1>
      <div className="grid gap-8">
        {agencias.map((ag) => (
          <Card key={ag.id} className="p-8 rounded-[3rem] shadow-2xl border-none bg-white">
            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-100 border-none" />
                <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-100 border-none" />
                <div className="relative">
                  <Instagram size={20} className="absolute left-4 top-4 text-slate-400" />
                  <Input value={ag.instagram_url} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Link Instagram" className="h-14 rounded-2xl pl-12 font-bold bg-slate-100 border-none" />
                </div>
                <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3">
                  <p className="text-[10px] font-black text-emerald-400 uppercase italic">Pago Móvil Agencia</p>
                  <Input value={ag.banco_nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={ag.banco_telefono} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Tlf" className="bg-white/10 border-none text-white h-12" />
                    <Input value={ag.banco_cedula} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12" />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-slate-400">Publicidad (Final App)</p>
                <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center bg-slate-50 overflow-hidden">
                  {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={64} className="text-slate-200" />}
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, ag.id)} className="absolute inset-0 opacity-0 cursor-pointer" />
                  {isUploading === ag.id && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}
                </div>
                <Button onClick={() => updateAgencia(ag)} className="w-full h-16 bg-emerald-600 font-black uppercase rounded-2xl text-lg shadow-xl"><Save className="mr-2"/> Guardar Todo</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
