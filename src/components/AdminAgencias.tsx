import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera, Trash2, Smartphone } from "lucide-react";
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

  const handleUpload = async (e: any, agenciaId: string, field: 'logo_url' | 'publicidad_url') => {
    const file = e.target.files[0];
    if (!file) return;
    setUpId(agenciaId + field);
    try {
      const fileName = `${field}_${agenciaId}_${Date.now()}`;
      const { error: upErr } = await supabase.storage.from('agencias').upload(fileName, file);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      if (dbErr) throw dbErr;
      toast.success("Imagen cargada con éxito");
      fetchAgencias();
    } catch (err: any) { toast.error("Error al subir"); } finally { setUpId(null); }
  };

  const saveAgencia = async (ag: any) => {
    const { error } = await supabase.from('agencias').update({
      nombre: ag.nombre, whatsapp: ag.whatsapp, instagram_url: ag.instagram_url,
      banco_nombre: ag.banco_nombre, banco_telefono: ag.banco_telefono, banco_cedula: ag.banco_cedula
    }).eq('id', ag.id);
    if (!error) toast.success("¡Datos guardados!");
    else toast.error("Error al guardar");
  };

  if (loading) return <div className="p-20 text-center font-black">Sincronizando Admin...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12 bg-slate-50 min-h-screen text-slate-900 text-left">
      <h1 className="text-4xl font-black uppercase italic border-b-8 border-emerald-500 pb-2">Gestión de Agencias</h1>
      <div className="grid gap-10">
        {agencias.map((ag) => (
          <Card key={ag.id} className="p-8 lg:p-12 rounded-[3rem] shadow-2xl border-none bg-white">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="space-y-6">
                <p className="text-[11px] font-black uppercase text-emerald-500 italic tracking-widest">1. Identidad y Logo</p>
                <div className="flex flex-col items-center p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 gap-4">
                   <div className="relative w-32 h-32 rounded-full bg-white border-4 border-emerald-500 shadow-xl overflow-hidden flex items-center justify-center">
                      {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-200" />}
                      <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {upId === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                   </div>
                   <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase">Cambiar Logo</Button>
                </div>
                <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-100 border-none" />
                <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-100 border-none" />
                <div className="relative">
                  <Instagram className="absolute left-4 top-4 text-pink-500" size={20} />
                  <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Link Instagram" className="h-14 rounded-2xl pl-12 font-bold bg-slate-100 border-none" />
                </div>
              </div>
              <div className="space-y-6">
                <p className="text-[11px] font-black uppercase text-blue-500 italic tracking-widest">2. Pago Móvil</p>
                <div className="p-8 bg-slate-900 rounded-[3rem] space-y-4 shadow-2xl">
                  <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12 rounded-xl" />
                  <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Tlf" className="bg-white/10 border-none text-white h-12 rounded-xl" />
                  <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12 rounded-xl" />
                </div>
                <Button onClick={() => saveAgencia(ag)} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2rem] text-xl shadow-xl transition-all">Guardar Agencia</Button>
              </div>
              <div className="space-y-6">
                <p className="text-[11px] font-black uppercase text-amber-500 italic tracking-widest">3. Publicidad</p>
                <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center bg-slate-50 overflow-hidden group">
                  {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                  <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {upId === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
                <Button variant="outline" className="w-full rounded-2xl font-black text-xs uppercase">Adjuntar Arte Publicitario</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
