import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Upload, Instagram, Loader2, Image as ImageIcon, Camera, Trash2, Key, Ticket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [codigosVip, setCodigosVip] = useState<any[]>([]); // Nueva lista para códigos VIP
  const [nuevoVip, setNuevoVip] = useState(""); // Estado para el nuevo código
  const [loading, setLoading] = useState(true);
  const [upId, setUpId] = useState<string | null>(null);

  useEffect(() => { 
    fetchAgencias(); 
    fetchCodigosVip();
  }, []);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
    setLoading(false);
  };

  // --- FUNCIÓN PARA VER LOS CÓDIGOS VIP EXISTENTES ---
  const fetchCodigosVip = async () => {
    const { data } = await supabase.from('codigos_vip').select('*').order('created_at', { ascending: false });
    if (data) setCodigosVip(data);
  };

  // --- FUNCIÓN PARA CREAR UN NUEVO CÓDIGO VIP ---
  const handleCrearVip = async () => {
    if (!nuevoVip.toUpperCase().includes("VIP")) {
      return toast.error("El código debe contener la palabra VIP");
    }

    const { error } = await supabase
      .from('codigos_vip')
      .insert([{ 
        codigo: nuevoVip.toUpperCase().trim(),
        expira_el: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Dura 24h
      }]);

    if (!error) {
      toast.success("¡Código VIP generado!");
      setNuevoVip("");
      fetchCodigosVip();
    } else {
      toast.error("Error: El código ya existe o la tabla no está lista");
    }
  };

  const handleBorrarVip = async (id: string) => {
    await supabase.from('codigos_vip').delete().eq('id', id);
    fetchCodigosVip();
    toast.info("Código eliminado");
  };

  // --- LOGIC DE CARGA DE IMAGENES ---
  const handleUpload = async (e: any, agenciaId: string, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    setUpId(agenciaId + field);
    try {
      const fileName = `${field}_${agenciaId}_${Date.now()}`;
      await supabase.storage.from('agencias').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('agencias').getPublicUrl(fileName);
      await supabase.from('agencias').update({ [field]: publicUrl }).eq('id', agenciaId);
      toast.success("Imagen cargada");
      fetchAgencias();
    } catch (err: any) { toast.error("Error al subir"); } 
    finally { setUpId(null); }
  };

  const saveAgencia = async (ag: any) => {
    await supabase.from('agencias').update({
      nombre: ag.nombre, whatsapp: ag.whatsapp, instagram_url: ag.instagram_url,
      banco_nombre: ag.banco_nombre, banco_telefono: ag.banco_telefono, banco_cedula: ag.banco_cedula
    }).eq('id', ag.id);
    toast.success("Agencia guardada perfectamente");
  };

  if (loading) return <div className="p-20 text-center font-black">Sincronizando Búnker Admin...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-10 space-y-16 bg-slate-50 min-h-screen text-left">
      
      {/* SECCIÓN 1: GESTIÓN DE AGENCIAS */}
      <section className="space-y-8">
        <h1 className="text-4xl font-black uppercase italic border-l-8 border-emerald-500 pl-4 text-slate-900">Gestión de Agencias</h1>
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
                  <Input value={ag.nombre} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, nombre: e.target.value} : x))} placeholder="Nombre" className="h-14 rounded-2xl font-black uppercase bg-slate-100 border-none" />
                  <Input value={ag.whatsapp} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, whatsapp: e.target.value} : x))} placeholder="WhatsApp" className="h-14 rounded-2xl font-black bg-slate-100 border-none" />
                  <Input value={ag.instagram_url || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, instagram_url: e.target.value} : x))} placeholder="URL Instagram" className="h-14 rounded-2xl pl-12 font-bold bg-slate-100 border-none" />
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-slate-900 rounded-[2rem] space-y-3">
                    <Input value={ag.banco_nombre || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_nombre: e.target.value} : x))} placeholder="Banco" className="bg-white/10 border-none text-white h-12" />
                    <Input value={ag.banco_telefono || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_telefono: e.target.value} : x))} placeholder="Tlf" className="bg-white/10 border-none text-white h-12" />
                    <Input value={ag.banco_cedula || ""} onChange={e => setAgencias(agencias.map(x => x.id === ag.id ? {...x, banco_cedula: e.target.value} : x))} placeholder="Cédula" className="bg-white/10 border-none text-white h-12" />
                  </div>
                  <Button onClick={() => saveAgencia(ag)} className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase rounded-2xl shadow-xl">Guardar Agencia</Button>
                </div>
                <div className="space-y-6">
                  <div className="relative h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex items-center justify-center bg-slate-50 overflow-hidden text-center">
                    {ag.publicidad_url ? <img src={ag.publicidad_url} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-200" />}
                    <input type="file" onChange={(e) => handleUpload(e, ag.id, 'publicidad_url')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: GENERADOR DE CÓDIGOS VIP (LO QUE USTED PIDIÓ) */}
      <section className="space-y-8">
        <h2 className="text-3xl font-black uppercase italic border-l-8 border-amber-500 pl-4 text-slate-900 flex items-center gap-3">
          <ShieldCheck size={32} className="text-amber-500" /> Bóveda de Códigos VIP
        </h2>
        
        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          {/* CREADOR */}
          <Card className="p-8 rounded-[3rem] shadow-xl border-none bg-slate-900 text-white space-y-6">
             <p className="text-xs font-black uppercase text-amber-400 tracking-widest">Generar Nueva Llave</p>
             <div className="space-y-4">
                <Input 
                  value={nuevoVip} 
                  onChange={e => setNuevoVip(e.target.value)}
                  placeholder="Ej: VIP-MAESTRO-24" 
                  className="bg-white/10 border-none h-16 rounded-2xl text-xl font-black text-center placeholder:text-white/20"
                />
                <Button onClick={handleCrearVip} className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black uppercase rounded-2xl text-lg">
                  <Plus className="mr-2" /> Crear Código VIP
                </Button>
                <p className="text-[10px] opacity-40 text-center uppercase font-bold">Cada código habilitará el acceso por 24 horas</p>
             </div>
          </Card>

          {/* LISTADO DE CÓDIGOS */}
          <Card className="p-8 rounded-[3rem] shadow-xl border-none bg-white">
             <p className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Códigos Activos en el Sistema</p>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {codigosVip.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 border rounded-2xl flex justify-between items-center group">
                     <div className="flex flex-col">
                        <span className="font-black text-emerald-600 text-sm tracking-tighter">{c.codigo}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Exp: {new Date(c.expira_el).toLocaleDateString()}</span>
                     </div>
                     <button onClick={() => handleBorrarVip(c.id)} className="text-red-300 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                     </button>
                  </div>
                ))}
                {codigosVip.length === 0 && <p className="col-span-full text-center py-10 text-slate-300 font-black uppercase italic">No has generado códigos hoy</p>}
             </div>
          </Card>
        </div>
      </section>

    </div>
  );
}
