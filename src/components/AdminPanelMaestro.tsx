import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Key, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  // ESTADOS PARA LA AGENCIA
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");
  const [pagoMovil, setPagoMovil] = useState("");
  const [cedula, setCedula] = useState("");
  const [banco, setBanco] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Manejar selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Crea vista previa inmediata
    }
  };

  // LÓGICA DE GUARDADO PROFESIONAL
  const handleSaveAgencia = async () => {
    if (!nombre || !pagoMovil || !cedula || !banco) {
      return toast.error("Faltan datos obligatorios");
    }

    setLoading(true);
    try {
      let publicImageUrl = "";

      // 1. Subir imagen a Supabase Storage (si existe)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `publicidad/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ANIMALITOS') // Usamos tu bucket existente
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('ANIMALITOS')
          .getPublicUrl(filePath);
        
        publicImageUrl = urlData.publicUrl;
      }

      // 2. Guardar en la base de datos (Tabla agencias)
      // Nota: Asegúrate de tener una tabla 'agencies' con estas columnas
      const { error: dbError } = await supabase
        .from('agencies' as any) 
        .insert([{
          name: nombre,
          phone: pagoMovil,
          rif: cedula,
          bank: banco,
          ad_image: publicImageUrl,
          active: true
        }]);

      if (dbError) throw dbError;

      toast.success("AGENCIA CREADA EXITOSAMENTE");
      
      // Limpiar formulario
      setNombre(""); setPagoMovil(""); setCedula(""); setBanco("");
      setImageFile(null); setPreviewUrl(null);

    } catch (error: any) {
      console.error(error);
      toast.error("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500 px-2">
      {/* PESTAÑAS */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias'].map((tab: any) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[80px] px-3 py-3 rounded-full font-black text-[9px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {adminTab === 'resultados' && <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4"><ResultsInsert /></div>}
      
      {adminTab === 'agencias' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl md:text-3xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 border-slate-100 pb-4">
             <Store size={32} /> GESTIÓN AGENCIAS
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600">Nombre de la Agencia</label>
                <Input value={nombre} onChange={e => setNombre(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg" placeholder="Nombre" />
              </div>

              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600">Número de Pago Móvil</label>
                <Input value={pagoMovil} onChange={e => setPagoMovil(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg" placeholder="04xx..." />
              </div>

              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600">Cédula / RIF</label>
                <Input value={cedula} onChange={e => setCedula(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg" placeholder="V-xxx" />
              </div>

              <div className="space-y-3">
                <label className="font-black text-sm uppercase ml-2 text-slate-600">Banco</label>
                <Input value={banco} onChange={e => setBanco(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-slate-900 text-lg" placeholder="Banco" />
              </div>

              {/* AREA DE CARGA DE IMAGEN MEJORADA */}
              <div className="space-y-3 md:col-span-2">
                <label className="font-black text-sm uppercase ml-2 text-slate-600">Publicidad (Imagen)</label>
                <div className="relative h-40 w-full">
                   <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                   />
                   <div className={`absolute inset-0 border-4 border-dashed border-slate-900 rounded-3xl flex flex-col items-center justify-center bg-slate-50 transition-all ${previewUrl ? 'border-emerald-500 bg-emerald-50' : ''}`}>
                      {previewUrl ? (
                        <div className="flex items-center gap-4 p-2">
                          <img src={previewUrl} className="h-32 w-48 object-cover rounded-xl border-2 border-slate-900 shadow-md" />
                          <div className="flex flex-col">
                            <span className="text-emerald-600 font-black text-xs flex items-center gap-1 uppercase"><CheckCircle2 size={14}/> Imagen Lista</span>
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Haz clic para cambiar</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="text-slate-400 mb-2" size={32} />
                          <span className="font-black text-slate-400 uppercase text-xs">Toca para seleccionar imagen publicitaria</span>
                        </>
                      )}
                   </div>
                </div>
              </div>
           </div>

           <Button 
            disabled={loading}
            onClick={handleSaveAgencia}
            className="w-full h-20 bg-emerald-500 rounded-3xl font-black uppercase text-white shadow-xl border-b-8 border-emerald-700 text-2xl active:scale-95 transition-all disabled:opacity-50"
           >
             {loading ? <><Loader2 className="animate-spin mr-2" /> GUARDANDO...</> : "GUARDAR DATOS AGENCIA"}
           </Button>
        </div>
      )}
    </div>
  );
}
