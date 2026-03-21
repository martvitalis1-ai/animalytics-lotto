import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera, Trash2, ShieldCheck, Plus, Map as MapIcon, Edit3 } from "lucide-react";
import { toast } from "sonner";

interface AdminAgenciasProps {
  selfManagedId?: string | null; // Si viene este ID, es un dueño de agencia alquilada
}

export function AdminAgencias({ selfManagedId }: AdminAgenciasProps) {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [codigosVip, setCodigosVip] = useState<any[]>([]);
  const [nuevoVip, setNuevoVip] = useState("");
  const [loading, setLoading] = useState(true);
  const [upId, setUpId] = useState<string | null>(null);

  // Determinar si es modo "Dueño de Agencia" o "Jefe Maestro"
  const isAgencyOwner = !!selfManagedId;

  useEffect(() => {
    fetchTodo();
  }, [selfManagedId]);

  const fetchTodo = async () => {
    try {
      setLoading(true);
      
      // CARGA DE AGENCIAS FILTRADA
      let query = (supabase.from as any)('agencias').select('*');
      
      // Si es dueño de agencia, solo traemos SU fila
      if (isAgencyOwner) {
        query = query.eq('id', selfManagedId);
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data: agData } = await query;
      if (agData) setAgencias(agData);

      // SOLO EL JEFE MAESTRO VE LOS VIP
      if (!isAgencyOwner) {
        const { data: vipData } = await (supabase.from as any)('codigos_vip').select('*').order('created_at', { ascending: false });
        if (vipData) setCodigosVip(vipData);
      }

    } catch (e) {
      console.error("Fallo crítico:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: any, agenciaId: string, field: 'logo_url' | 'publicidad_url' | 'imagen_ruleta_url') => {
    const file = e.target.files[0];
    if (!file) return;

    setUpId(agenciaId + field);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}_${agenciaId}_${Date.now()}.${fileExt}`;

      const { error: upErr } = await supabase.storage.from('agencias').upload(fileName, file);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      const { error: dbErr } = await (supabase.from as any)('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      if (dbErr) throw dbErr;

      toast.success("Imagen actualizada correctamente");
      fetchTodo();
    } catch (err: any) {
      toast.error("Error al subir imagen al bucket");
    } finally {
      setUpId(null);
    }
  };

  const saveAgencia = async (ag: any) => {
    try {
      const { error } = await (supabase.from as any)('agencias').update({
        nombre: ag.nombre,
        whatsapp: ag.whatsapp,
        instagram_url: ag.instagram_url,
        banco_nombre: ag.banco_nombre,
        banco_telefono: ag.banco_telefono,
        banco_cedula: ag.banco_cedula,
        nombre_dato_personalizado: ag.nombre_dato_personalizado // NUEVO CAMPO
      }).eq('id', ag.id);
      
      if (!error) toast.success("Configuración de banca guardada");
      else throw error;
    } catch (e) {
      toast.error("Error al guardar cambios");
    }
  };

  const handleCrearVip = async () => {
    if (!nuevoVip) return;
    try {
      const { error } = await (supabase.from as any)('codigos_vip').insert([{ 
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

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-xl">SINCRO DE PANEL ADMIN...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12 bg-slate-50 min-h-screen text-left text-slate-900">
      <h1 className="text-3xl font-black uppercase italic border-b-4 border-emerald-500 pb-2">
        {isAgencyOwner ? 'Gestión de Mi Banca' : 'Administración Central de Agencias'}
      </h1>
      
      <div className="grid gap-10">
        {(agencias || []).map((ag) => (
          <Card key={ag.id} className="p-8 lg:p-12 rounded-[3rem] shadow-2xl border-none bg-white">
            <div className="grid lg:grid-cols-3 gap-10">
              
              {/* BLOQUE 1: IDENTIDAD */}
              <div className="space-y-6">
                <div className="relative w-28 h-28 mx-auto rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden group">
                   {ag.logo_url ? <img src={ag.logo_url} className="w-full h-full object-cover" /> : <Camera className="m-auto mt-8 text-slate-300" size={40} />}
                   <input type="file" onChange={(e) => handleUpload(e, ag.id, 'logo_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {upId === ag.id + 'logo_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre de la Agencia</label>
                  <Input value={ag.nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} className="h-14 rounded-2xl font-black uppercase bg-slate-50 border-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Título Personalizado Dato IA</label>
                  <Input 
                    value={ag.nombre_dato_personalizado || ""} 
                    onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre_dato_personalizado: e.target.value} : x))} 
                    placeholder="Ej: DATO AGENCIA" 
                    className="h-14 rounded-2xl font-black bg-emerald-50 border-2 border-emerald-100 text-emerald-700" 
                  />
                </div>
                
                <Input value={ag.whatsapp || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp Operativo" className="h-14 rounded-2xl font-black bg-slate-50 border-none" />
              </div>

              {/* BLOQUE 2: PAGOS Y GUARDADO */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3">
                  <p className="text-[10px] font-black uppercase text-amber-400 text-center mb-2 tracking-widest">Datos para Recibir Pagos</p>
                  <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Teléfono Pago Móvil" className="bg-white/10 border-none text-white h-12" />
                  <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12" />
                </div>
                <Button onClick={() => saveAgencia(ag)} className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-3xl text-xl shadow-xl transition-all">Actualizar mi Banca</Button>
              </div>

              {/* BLOQUE 3: MAPAS Y PUBLICIDAD */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 text-center italic flex items-center justify-center gap-1">
                    <MapIcon size={12}/> Mapa de Ruleta Personalizado
                  </p>
                  <div className="relative h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center bg-slate-50 overflow-hidden">
                    {ag.imagen_ruleta_url ? <img src={ag.imagen_ruleta_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}
                    <input type="file" onChange={(e) => handleUpload(e, ag.id, 'imagen_ruleta_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {upId === ag.id + 'imagen_ruleta_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 text-center italic flex items-center justify-center gap-1">
                    <ImageIcon size={12}/> Publicidad (Banner Final)
                  </p>
                  <div className="relative h-44 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center bg-slate-50 overflow-hidden">
                    {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                    <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {upId === ag.id + 'publicidad_url' && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                  </div>
                </div>
              </div>

            </div>
          </Card>
        ))}
      </div>

      {/* SECCIÓN VIP (SOLO PARA EL JEFE MAESTRO) */}
      {!isAgencyOwner && (
        <section className="space-y-8 pt-10 border-t-8 border-slate-200">
          <h2 className="text-3xl font-black uppercase italic flex items-center gap-3"><ShieldCheck size={32} className="text-amber-500" /> Bóveda Maestro: Códigos VIP</h2>
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
             <Card className="p-8 bg-slate-900 text-white rounded-[3rem] space-y-6 shadow-2xl">
                <p className="text-xs font-black uppercase text-amber-400 tracking-widest text-center">Generar Llave para Usuarios</p>
                <Input value={nuevoVip} onChange={e => setNuevoVip(e.target.value)} placeholder="Ej: PRO-2026" className="bg-white/10 border-none h-16 rounded-2xl text-xl font-black text-center" />
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
                </div>
             </Card>
          </div>
        </section>
      )}
    </div>
  );
}
