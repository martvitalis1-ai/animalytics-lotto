import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => { fetchAgencias(); }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
    setLoading(false);
  };

  const handleUpload = async (e: any, agenciaId: string, field: 'logo_url' | 'publicidad_url') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingId(agenciaId + field);
    try {
      const fileName = `${field}_${agenciaId}_${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('agencias').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      if (dbError) throw dbError;

      toast.success("Imagen actualizada con éxito");
      fetchAgencias();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally { setUploadingId(null); }
  };

  const handleUpdateText = async (ag: any) => {
    const { error } = await supabase.from('agencias').update({
      nombre: ag.nombre,
      whatsapp: ag.whatsapp,
      instagram_url: ag.instagram_url,
      banco_nombre: ag.banco_nombre,
      banco_telefono: ag.banco_telefono,
      banco_cedula: ag.banco_cedula
    }).eq('id', ag.id);
    if (!error) toast.success("Datos guardados en la base de datos");
    else toast.error("Error al guardar");
  };

  if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest">Cargando Búnker Admin...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-10 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-black uppercase italic border-b-8 border-emerald-500 pb-2 text-slate-900">Gestión de Agencias Aliadas</h1>
      
      <div className="grid gap-10">
        {agencias.map((ag) => (
          <Card key={ag.id} className="p-8 rounded-[3rem] shadow-2xl border-none bg-white relative overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-10">
              
              {/* COLUMNA 1: IDENTIDAD */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic">1. Identidad de la Agencia</p>
                <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-3xl">
                   <div className="relative w-24 h-24 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden">
                      {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-6 text-slate-400" />}
                      <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      {uploadingId === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase">Toca el círculo para subir Logo</p>
                </div>
                <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-50 border-none" />
                <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-50 border-none" />
                <div className="relative">
                  <Instagram size={20} className="absolute left-4 top-4 text-pink-500" />
                  <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="Link Instagram" className="h-14 rounded-2xl pl-12 font-bold bg-slate-50 border-none" />
                </div>
              </div>

              {/* COLUMNA 2: PAGOS */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest italic">2. Datos de Pago Móvil</p>
                <div className="p-6 bg-slate-900 rounded-[2.5rem] space-y-4">
                  <Input value={ag.banco_nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white font-bold h-12" />
                  <Input value={ag.banco_telefono} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Teléfono" className="bg-white/10 border-none text-white font-bold h-12" />
                  <Input value={ag.banco_cedula} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white font-bold h-12" />
                </div>
                <Button onClick={() => handleUpdateText(ag)} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl text-lg shadow-xl">
                  <Save className="mr-2"/> Guardar Cambios
                </Button>
              </div>

              {/* COLUMNA 3: PUBLICIDAD */}
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest italic">3. Publicidad (Banner)</p>
                <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center bg-slate-50 overflow-hidden group">
                  {ag.publicidad_url ? (
                    <img src={ag.publicidad_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                        <ImageIcon size={48} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-[10px] font-black text-slate-400 uppercase">Sube el arte publicitario aquí</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={e => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                  {uploadingId === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
                <p className="text-[9px] text-center text-slate-400 font-bold px-4">ESTA IMAGEN SE VERÁ AL FINAL DE LAS JUGADAS DE TODOS LOS CLIENTES</p>
              </div>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
