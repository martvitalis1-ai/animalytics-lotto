import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera, Trash2, Key, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  // Inicializamos siempre con arrays vacíos para evitar el error de .map()
  const [agencias, setAgencias] = useState<any[]>([]);
  const [codigosVip, setCodigosVip] = useState<any[]>([]);
  const [nuevoVip, setNuevoVip] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchTodo();
  }, []);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      // Cargar Agencias
      const { data: agData } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
      if (agData) setAgencias(agData);

      // Cargar Códigos VIP
      const { data: vipData } = await supabase.from('codigos_vip').select('*').order('created_at', { ascending: false });
      if (vipData) setCodigosVip(vipData);
    } catch (e) {
      console.error("Error en carga:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: any, agenciaId: string, field: 'logo_url' | 'publicidad_url') => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(agenciaId + field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}_${agenciaId}_${Date.now()}.${fileExt}`;

      const { error: upErr } = await supabase.storage.from('agencias').upload(fileName, file);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      if (dbErr) throw dbErr;

      toast.success("Imagen cargada");
      fetchTodo();
    } catch (err: any) {
      toast.error("Error al subir");
    } finally {
      setIsUploading(null);
    }
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
    
    if (!error) toast.success("Agencia guardada");
    else toast.error("Error al guardar");
  };

  const handleCrearVip = async () => {
    if (!nuevoVip.toUpperCase().includes("VIP")) return toast.error("El código debe decir VIP");
    const { error } = await supabase.from('codigos_vip').insert([{ 
      codigo: nuevoVip.toUpperCase().trim(),
      expira_el: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }]);
    if (!error) {
      setNuevoVip("");
      fetchTodo();
      toast.success("VIP Generado");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Sincronizando Búnker...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12 bg-slate-50 min-h-screen text-slate-900 text-left">
      <h1 className="text-3xl font-black uppercase italic border-b-4 border-emerald-500 pb-2">Administración General</h1>
      
      {/* SECCIÓN AGENCIAS */}
      <div className="grid gap-8">
        {(agencias || []).map((ag) => (
          <Card key={ag.id} className="p-6 lg:p-10 rounded-[3rem] shadow-xl border-none bg-white">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Lado 1: Identidad */}
              <div className="space-y-4">
                <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-slate-100 bg-slate-50 overflow-hidden">
                   {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-6 text-slate-300" />}
                   <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {isUploading === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                </div>
                <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="font-black uppercase" />
                <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="font-black" />
                <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Instagram Link" className="font-bold text-xs" />
              </div>
              
              {/* Lado 2: Pago */}
              <div className="space-y-4">
                 <div className="p-5 bg-slate-900 rounded-3xl space-y-2">
                    <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white text-xs h-10" />
                    <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Tlf" className="bg-white/10 border-none text-white text-xs h-10" />
                    <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white text-xs h-10" />
                 </div>
                 <Button onClick={() => saveAgencia(ag)} className="w-full h-14 bg-emerald-600 rounded-2xl font-black uppercase shadow-lg">Guardar Agencia</Button>
              </div>

              {/* Lado 3: Publicidad */}
              <div className="space-y-2 text-center">
                <p className="text-[9px] font-black uppercase text-slate-400">Publicidad (Banner)</p>
                <div className="relative h-40 border-4 border-dashed rounded-3xl overflow-hidden bg-slate-50 flex items-center justify-center">
                  {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-200" size={40} />}
                  <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  {isUploading === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20"><Loader2 className="animate-spin" /></div>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SECCIÓN VIP */}
      <section className="space-y-6 pt-10 border-t-4">
        <h2 className="text-2xl font-black uppercase flex items-center gap-2"><ShieldCheck className="text-amber-500" /> Bóveda VIP</h2>
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
           <Card className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
              <p className="text-xs font-black text-amber-400 uppercase tracking-widest text-center">Generar Código</p>
              <Input value={nuevoVip} onChange={e => setNuevoVip(e.target.value)} placeholder="Ej: VIP-MAESTRO" className="bg-white/10 border-none text-center font-black h-14 text-lg" />
              <Button onClick={handleCrearVip} className="w-full h-14 bg-amber-500 text-slate-900 font-black uppercase rounded-xl">Generar VIP</Button>
           </Card>
           
           <Card className="p-6 bg-white rounded-3xl shadow-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {(codigosVip || []).map(c => (
                   <div key={c.id} className="p-3 bg-slate-50 border rounded-xl flex justify-between items-center group">
                      <div className="text-left">
                        <p className="font-black text-emerald-600 text-xs">{c.codigo}</p>
                        <p className="text-[8px] opacity-40 uppercase">Dura 24h</p>
                      </div>
                      <button onClick={async () => { await supabase.from('codigos_vip').delete().eq('id', c.id); fetchTodo(); }} className="text-red-300 hover:text-red-600"><Trash2 size={14}/></button>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </section>
    </div>
  );
}
