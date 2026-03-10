import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Save, Upload, Instagram, Store, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState<{ id: string, type: 'logo' | 'pub' } | null>(null);

  useEffect(() => { fetchAgencias(); }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
    setLoading(false);
  };

  // --- FUNCIÓN PARA SUBIR ARCHIVOS (LOGO O PUBLICIDAD) ---
  const handleUpload = async (e: any, agenciaId: string, type: 'logo' | 'pub') => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading({ id: agenciaId, type });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${agenciaId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Subir al Storage (Bucket 'agencias')
      const { error: uploadError } = await supabase.storage
        .from('agencias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obtener URL Pública
      const { data: { publicUrl } } = supabase.storage
        .from('agencias')
        .getPublicUrl(filePath);

      // 3. Actualizar la base de datos según el tipo
      const updateData = type === 'logo' ? { logo_url: publicUrl } : { publicidad_url: publicUrl };
      
      const { error: dbError } = await supabase
        .from('agencias')
        .update(updateData)
        .eq('id', agenciaId);

      if (dbError) throw dbError;

      toast.success(type === 'logo' ? "¡Logo actualizado!" : "¡Publicidad actualizada!");
      fetchAgencias();
    } catch (error: any) {
      toast.error("Error al subir: " + error.message);
    } finally {
      setIsUploading(null);
    }
  };

  // --- ACTUALIZAR DATOS DE TEXTO ---
  const handleUpdateAgencia = async (ag: any) => {
    const { error } = await supabase
      .from('agencias')
      .update({
        nombre: ag.nombre.toUpperCase(),
        whatsapp: ag.whatsapp.replace(/\D/g, ''),
        instagram_url: ag.instagram_url,
        banco_nombre: ag.banco_nombre.toUpperCase(),
        banco_telefono: ag.banco_telefono,
        banco_cedula: ag.banco_cedula
      })
      .eq('id', ag.id);

    if (!error) {
      toast.success("¡Cambios guardados con éxito!");
      fetchAgencias();
    } else {
      toast.error("Error al guardar cambios");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-xl italic">Sincronizando Panel Administrativo...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center border-b-4 border-emerald-500 pb-4">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Gestión de Agencias</h1>
        <div className="flex gap-2">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase">
                Agencias Activas: {agencias.length}
            </div>
        </div>
      </div>

      <div className="grid gap-12">
        {agencias.map((ag) => (
          <Card key={ag.id} className="p-8 lg:p-12 rounded-[4rem] shadow-3xl border-none bg-white relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12">
              
              {/* COLUMNA 1: IDENTIDAD Y PAGOS */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase text-emerald-500 tracking-[0.3em] flex items-center gap-2">
                    <Store size={16}/> Datos de Identidad
                  </p>
                  <Input 
                    value={ag.nombre} 
                    onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))}
                    placeholder="NOMBRE DE LA AGENCIA" 
                    className="h-16 rounded-3xl font-black text-xl uppercase bg-slate-100 border-none px-6" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      value={ag.whatsapp} 
                      onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))}
                      placeholder="WhatsApp (Ej: 58412...)" 
                      className="h-14 rounded-2xl font-black bg-slate-100 border-none" 
                    />
                    <div className="relative">
                      <Instagram size={20} className="absolute left-4 top-4 text-slate-400" />
                      <Input 
                        value={ag.instagram_url || ""} 
                        onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))}
                        placeholder="Link de Instagram" 
                        className="h-14 rounded-2xl pl-12 font-bold bg-slate-100 border-none text-sm" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[3rem] space-y-4 shadow-xl">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic flex items-center gap-2">
                    <Wallet size={14}/> Datos para que el cliente pague:
                  </p>
                  <Input 
                    value={ag.banco_nombre || ""} 
                    onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))}
                    placeholder="Nombre del Banco" 
                    className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      value={ag.banco_telefono || ""} 
                      onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))}
                      placeholder="Teléfono" 
                      className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" 
                    />
                    <Input 
                      value={ag.banco_cedula || ""} 
                      onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))}
                      placeholder="Cédula / RIF" 
                      className="bg-white/10 border-none text-white h-14 rounded-2xl font-black" 
                    />
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: IMÁGENES (LOGO Y PUBLICIDAD) */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {/* CARGA DE LOGO */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 text-center italic">Logo (Círculo)</p>
                    <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden group shadow-lg">
                       {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Store size={40} className="text-slate-200" />}
                       <input type="file" accept="image/*" onChange={e => handleUpload(e, ag.id, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                          <Upload className="text-white" size={24}/>
                       </div>
                       {isUploading?.id === ag.id && isUploading.type === 'logo' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30"><Loader2 className="animate-spin text-emerald-600" /></div>}
                    </div>
                  </div>

                  {/* CARGA DE PUBLICIDAD */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 text-center italic">Banner Publicitario</p>
                    <div className="relative h-32 rounded-[2rem] border-4 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden group shadow-lg">
                       {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-slate-200" />}
                       <input type="file" accept="image/*" onChange={e => handleUpload(e, ag.id, 'pub')} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center z-10">
                          <Upload className="text-white" size={24}/>
                       </div>
                       {isUploading?.id === ag.id && isUploading.type === 'pub' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30"><Loader2 className="animate-spin text-emerald-600" /></div>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <Button 
                    onClick={() => handleUpdateAgencia(ag)} 
                    className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-[2rem] text-xl shadow-2xl transition-all active:scale-95"
                  >
                    <Save className="mr-3" size={28}/> Guardar Todo la Configuración
                  </Button>
                  
                  <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest">
                    ID único de Agencia: {ag.id}
                  </p>
                </div>
              </div>

            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
