import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera, Trash2, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [codigosVip, setCodigosVip] = useState<any[]>([]);
  const [nuevoVip, setNuevoVip] = useState("");
  const [loading, setLoading] = useState(true);
  const [upId, setUpId] = useState<string | null>(null);

  useEffect(() => {
    fetchTodo();
  }, []);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      // Cargar Agencias con seguridad
      const { data: agData, error: agErr } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
      if (agErr) console.error("Error agencias:", agErr);
      if (agData) setAgencias(agData);

      // Cargar VIPs con seguridad
      const { data: vipData, error: vipErr } = await supabase.from('codigos_vip').select('*').order('created_at', { ascending: false });
      if (vipErr) console.error("Error vip:", vipErr);
      if (vipData) setCodigosVip(vipData);
    } catch (e) {
      console.error("Fallo crítico en carga:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: any, agenciaId: string, field: 'logo_url' | 'publicidad_url') => {
    const file = e.target.files[0];
    if (!file) return;

    setUpId(agenciaId + field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}_${agenciaId}_${Date.now()}.${fileExt}`;

      const { error: upErr } = await supabase.storage.from('agencias').upload(fileName, file);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      if (dbErr) throw dbErr;

      toast.success("Imagen actualizada");
      fetchTodo();
    } catch (err: any) {
      toast.error("Error al subir imagen");
    } finally {
      setUpId(null);
    }
  };

  const saveAgencia = async (ag: any) => {
    try {
      const { error } = await supabase.from('agencias').update({
        nombre: ag.nombre,
        whatsapp: ag.whatsapp,
        instagram_url: ag.instagram_url,
        banco_nombre: ag.banco_nombre,
        banco_telefono: ag.banco_telefono,
        banco_cedula: ag.banco_cedula
      }).eq('id', ag.id);
      
      if (!error) toast.success("Agencia guardada");
      else throw error;
    } catch (e) {
      toast.error("Error al guardar");
    }
  };

  const handleCrearVip = async () => {
    if (!nuevoVip) return;
    try {
      const { error } = await supabase.from('codigos_vip').insert([{ 
        codigo: nuevoVip.toUpperCase().trim(),
        expira_el: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }]);
      if (!error) {
        setNuevoVip("");
        fetchTodo();
        toast.success("Código VIP Creado");
      } else throw error;
    } catch (e) {
      toast.error("Error al crear código");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-xl">SINCRONIZANDO PANEL...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12 bg-slate-50 min-h-screen text-left text-slate-900">
      <h1 className="text-3xl font-black uppercase italic border-b-4 border-emerald-500 pb-2">Administración de Agencias</h1>
      
      <div className="grid gap-10">
        {(agencias || []).map((ag) => (
          <Card key={ag.id} className="p-8 lg:p-12 rounded-[3rem] shadow-2xl border-none bg-white">
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="relative w-28 h-28 mx-auto rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden group">
                   {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-8 text-slate-300" size={40} />}
                   <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="Subir Logo" />
                   {upId === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
                <Input value={ag.nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-50 border-none" />
                <Input value={ag.whatsapp || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-50 border-none" />
                <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Instagram Link" className="h-14 rounded-2xl font-bold bg-slate-50 border-none" />
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3">
                  <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Teléfono" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12" />
                </div>
                <Button onClick={() => saveAgencia(ag)} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl transition-all">Guardar Cambios</Button>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 italic">Publicidad (Banner Final)</p>
                <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center bg-slate-50 overflow-hidden">
                  {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                  <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="Subir Publicidad" />
                  {upId === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SECCIÓN VIP */}
      <section className="space-y-8 pt-10 border-t-8 border-slate-200">
        <h2 className="text-3xl font-black uppercase italic flex items-center gap-3"><ShieldCheck size={32} className="text-amber-500" /> Bóveda de Códigos VIP</h2>
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
           <Card className="p-8 bg-slate-900 text-white rounded-[3rem] space-y-6 shadow-2xl">
              <p className="text-xs font-black uppercase text-amber-400 tracking-widest text-center">Generar Nueva Llave</p>
              <Input value={nuevoVip} onChange={e => setNuevoVip(e.target.value)} placeholder="Ej: VIP-ORO-10" className="bg-white/10 border-none h-16 rounded-2xl text-xl font-black text-center placeholder:text-white/20" />
              <Button onClick={handleCrearVip} className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase rounded-2xl text-lg">Crear Código VIP</Button>
           </Card>
           
           <Card className="p-8 bg-white rounded-[3rem] shadow-xl border-none">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                 {(codigosVip || []).map((c) => (
                   <div key={c.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center group animate-in fade-in">
                      <div className="text-left">
                        <p className="font-black text-emerald-600 text-sm">{c.codigo}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Vence: {c.expira_el ? new Date(c.expira_el).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <button onClick={async () => { await supabase.from('codigos_vip').delete().eq('id', c.id); fetchTodo(); }} className="text-red-300 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                   </div>
                 ))}
                 {codigosVip.length === 0 && <p className="col-span-full text-center py-10 text-slate-300 font-black uppercase italic">No hay códigos activos</p>}
              </div>
           </Card>
        </div>
      </section>
    </div>
  );
}
