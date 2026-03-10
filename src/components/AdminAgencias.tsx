import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trash2, Plus, Loader2, Store, 
  Image as ImageIcon, Instagram, 
  Upload, Save, Smartphone, 
  Banknote, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [agencias, setAgencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Formulario de Agencia
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [banco, setBanco] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefonoBanco, setTelefonoBanco] = useState("");
  
  // Archivos
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pubFile, setPubFile] = useState<File | null>(null);

  const fetchAgencias = async () => {
    const { data } = await supabase.from('agencias').select('*').order('created_at', { ascending: false });
    if (data) setAgencias(data);
  };

  useEffect(() => { fetchAgencias(); }, []);

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('agencias')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('agencias').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!nombre || !whatsapp || !banco) {
      return toast.error("Nombre, WhatsApp y Banco son obligatorios");
    }

    setLoading(true);
    try {
      let logoUrl = null;
      let publicidadUrl = null;

      // Cargar Logo si existe
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, 'logos');
      }

      // Cargar Publicidad si existe
      if (pubFile) {
        publicidadUrl = await uploadFile(pubFile, 'publicidad');
      }

      const { error } = await supabase.from('agencias').insert({ 
        nombre: nombre.toUpperCase(), 
        whatsapp: whatsapp.replace(/\D/g, ''),
        instagram_url: instagram.trim(),
        publicidad_url: publicidadUrl,
        banco_nombre: banco.toUpperCase(),
        banco_cedula: cedula.trim(),
        banco_telefono: telefonoBanco.trim(),
        logo_url: logoUrl,
        activa: true
      });

      if (error) throw error;

      toast.success("Agencia registrada y configurada con éxito");
      
      // Limpiar formulario
      setNombre(""); setWhatsapp(""); setInstagram("");
      setBanco(""); setCedula(""); setTelefonoBanco("");
      setLogoFile(null); setPubFile(null);
      
      fetchAgencias();
    } catch (e: any) {
      console.error(e);
      toast.error("Error al guardar. Verifica el bucket 'agencias' en el Storage.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('agencias').delete().eq('id', id);
    if (!error) {
      toast.success("Agencia eliminada");
      fetchAgencias();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card className="border-2 border-primary/20 shadow-2xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/5 rounded-t-xl">
          <CardTitle className="text-xl font-black uppercase italic flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" /> 
            Panel de Control: Agencias y Marketing
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* BLOQUE 1: IDENTIDAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                <Store size={18} className="text-primary"/>
                <p className="text-xs font-black uppercase tracking-widest text-primary">1. Identidad y Redes</p>
              </div>
              <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Comercial" className="font-bold uppercase" />
              <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp de Ventas" className="font-bold" />
              <div className="relative">
                <Instagram size={18} className="absolute left-3 top-3 text-muted-foreground" />
                <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="URL de Instagram" className="pl-10 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase ml-1 opacity-60">Logo Agencia</label>
                <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border border-dashed">
                  <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="cursor-pointer text-[10px] h-8" />
                  {logoFile && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
              </div>
            </div>

            {/* BLOQUE 2: PAGOS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                <Banknote size={18} className="text-emerald-500"/>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-500">2. Pago Móvil (Premios)</p>
              </div>
              <Input value={banco} onChange={e => setBanco(e.target.value)} placeholder="Nombre del Banco" className="font-bold" />
              <Input value={cedula} onChange={e => setCedula(e.target.value)} placeholder="Cédula o RIF" className="font-bold" />
              <Input value={telefonoBanco} onChange={e => setTelefonoBanco(e.target.value)} placeholder="Teléfono de Pago Móvil" className="font-bold" />
            </div>

            {/* BLOQUE 3: PUBLICIDAD */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-500/20 pb-2">
                <ImageIcon size={18} className="text-amber-500"/>
                <p className="text-xs font-black uppercase tracking-widest text-amber-500">3. Marketing y Banner</p>
              </div>
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 flex flex-col items-center justify-center gap-3 min-h-[150px]">
                <p className="text-[10px] font-black uppercase text-center text-amber-600">Banner Publicitario (Galería)</p>
                <div className="relative w-full">
                   <Input type="file" accept="image/*" onChange={e => setPubFile(e.target.files?.[0] || null)} className="opacity-0 absolute inset-0 cursor-pointer z-10" />
                   <div className="w-full h-20 border-2 border-dashed border-amber-500/30 rounded-xl flex flex-col items-center justify-center gap-1 bg-white">
                      {pubFile ? (
                        <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12}/> {pubFile.name.substring(0, 15)}...</span>
                      ) : (
                        <>
                          <Upload size={20} className="text-amber-500" />
                          <span className="text-[9px] font-black uppercase opacity-60">Subir Banner de Publicidad</span>
                        </>
                      )}
                   </div>
                </div>
                <p className="text-[8px] text-muted-foreground italic text-center">Esta imagen aparecerá al final del módulo de jugadas del cliente.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={loading} 
            className="w-full h-16 rounded-2xl font-black text-lg italic uppercase shadow-xl hover:scale-[1.01] transition-all bg-primary"
          >
            {loading ? (
              <><Loader2 className="animate-spin mr-3" size={24} /> Procesando Configuración...</>
            ) : (
              <><Save className="mr-3" size={24} /> Guardar y Activar Agencia Aliada</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* LISTADO DE AGENCIAS ACTIVAS */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2 text-slate-500">
           Agencias en el Sistema <span className="bg-slate-200 px-2 py-0.5 rounded-full text-[10px]">{agencias.length}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencias.map(ag => (
            <div key={ag.id} className="bg-white p-5 rounded-[2rem] border shadow-lg flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 overflow-hidden border-2 border-primary/20 flex items-center justify-center">
                    {ag.logo_url ? (
                      <img src={ag.logo_url} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="text-white/20" size={24}/>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase leading-none">{ag.nombre}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase italic tracking-tighter">
                      {ag.banco_nombre}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(ag.id)}
                  className="rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                 <div className="bg-slate-50 p-2 rounded-xl border flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase">WhatsApp</span>
                    <span className="text-[10px] font-bold">+{ag.whatsapp}</span>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-xl border flex flex-col items-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Marketing</span>
                    <span className="text-[10px] font-bold text-amber-600">{ag.publicidad_url ? 'Activo' : 'Inactivo'}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
