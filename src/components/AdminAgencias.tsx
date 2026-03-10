import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upId, setUpId] = useState<string | null>(null);

  useEffect(() => { fetchAgencias(); }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
    setLoading(false);
  };

  const handleUpload = async (e: any, agenciaId: string, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpId(agenciaId + field);
    try {
      const fileName = `${field}_${Date.now()}`;
      await supabase.storage.from('agencias').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      toast.success("Imagen cargada");
      fetchAgencias();
    } catch (err: any) { toast.error("Error al subir"); } 
    finally { setUpId(null); }
  };

  const saveAgencia = async (ag: any) => {
    const { error } = await supabase.from('agencias').update({
      nombre: ag.nombre,
      whatsapp: ag.whatsapp,
      instagram_url: ag.instagram_url,
      banco_nombre: ag.banco_nombre,
      banco_telefono: ag.banco_telefono,
      banco_cedula: ag.banco_cedula
    }).eq('id', ag.id);
    if (!error) toast.success("Agencia guardada perfectamente");
  };

  if (loading) return <div className="p-20 text-center font-black">Cargando Administrador...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10 text-left">
      <h1 className="text-3xl font-black uppercase italic border-b-4 border-emerald-500 pb-2">Gestión de Agencias Aliadas</h1>
      <div className="grid gap-10">
        {agencias.map((ag) => (
          <Card key={ag.id} className="p-8 rounded-[3rem] shadow-2xl border-none bg-white">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="relative w-24 h-24 rounded-full bg-slate-100 border mx-auto overflow-hidden group">
                   {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-6 text-slate-300" />}
                   <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {upId === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                </div>
                <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-50 border-none" />
                <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-50 border-none" />
                <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Link Instagram" className="h-14 rounded-2xl font-bold bg-slate-50 border-none" />
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3">
                  <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Tlf" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12" />
                </div>
                <Button onClick={() => saveAgencia(ag)} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl shadow-xl"><Save className="mr-2"/> Guardar Todo</Button>
              </div>
              <div className="space-y-6">
                <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center bg-slate-50 overflow-hidden">
                  {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                  <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {upId === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
