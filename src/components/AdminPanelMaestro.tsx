import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert"; // Asegúrate de que este archivo exista
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, Key, Upload, Loader2, CheckCircle2, 
  Trash2, Edit3, ShieldCheck, Gift, Database 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  // --- ESTADOS PARA AGENCIAS ---
  const [loading, setLoading] = useState(false);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- CARGA INICIAL ---
  useEffect(() => { 
    if (auth) {
      loadAgencias();
    } 
  }, [auth]);

  const loadAgencias = async () => {
    const { data } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(data || []);
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
    } else {
      toast.error("CÓDIGO DENEGADO");
    }
  };

  // --- FUNCIONES AGENCIAS ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteAgency = async (id: string) => {
    if (!confirm("¿Borrar esta agencia?")) return;
    await supabase.from('agencies').delete().eq('id', id);
    toast.success("ELIMINADA");
    loadAgencias();
  };

  const handleEditAgency = (agency: any) => {
    setEditingId(agency.id);
    setFormData({ name: agency.name, phone: agency.phone, rif: agency.rif, bank: agency.bank, ad_image: agency.ad_image });
    setPreviewUrl(agency.ad_image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAgencia = async () => {
    if (!formData.name || !formData.phone || !formData.rif || !formData.bank) {
      return toast.error("Faltan datos");
    }
    setLoading(true);
    try {
      let finalImageUrl = formData.ad_image;
      if (imageFile) {
        const fileName = `publicidad/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('ANIMALITOS').upload(fileName, imageFile);
        const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;
      }
      const payload = { ...formData, ad_image: finalImageUrl };
      if (editingId) {
        await supabase.from('agencies').update(payload).eq('id', editingId);
        toast.success("ACTUALIZADA");
      } else {
        await supabase.from('agencies').insert([payload]);
        toast.success("CREADA");
      }
      setFormData({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setImageFile(null); setPreviewUrl(null); setEditingId(null);
      loadAgencias();
    } catch (e: any) {
      toast.error("Error: " + e.message);
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
        <Button onClick={handleLogin} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-white border-4 border-slate-900 shadow-xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 px-2 animate-in fade-in duration-500">
      {/* NAVEGACIÓN PRINCIPAL (EL ÓVALO) */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {(['resultados', 'accesos', 'regalos', 'agencias'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- CONTENIDO DE PESTAÑAS --- */}

      {/* 1. RESULTADOS */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4">
          <ResultsInsert />
        </div>
      )}

      {/* 2. ACCESOS */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4">
             <ShieldCheck /> Códigos de App
           </h3>
           <div className="flex gap-4">
              <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="NUEVO CÓDIGO" />
              <Button className="bg-emerald-500 h-14 px-8 rounded-2xl font-black text-white shadow-lg border-b-4 border-emerald-700">CREAR</Button>
           </div>
           <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl flex justify-between items-center">
              <span className="font-black text-slate-700">GANADOR2026 (Maestro)</span>
              <div className="flex gap-2 opacity-30"><Edit3 size={18}/><Trash2 size={18}/></div>
           </div>
        </div>
      )}

      {/* 3. REGALOS / EXPLOSIVOS */}
      {adminTab === 'regalos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
           <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4">
             <Gift /> Animales Regalo (Explosivos)
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="font-black text-xs uppercase text-slate-400 ml-2">Seleccionar Lotería</label>
                 <select className="w-full h-14 border-4 border-slate-900 rounded-2xl px-4 font-black uppercase bg-slate-50">
                    <option>Lotto Activo</option>
                    <option>La Granjita</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="font-black text-xs uppercase text-slate-400 ml-2">Animales (Ej: 12, 05, 33)</label>
                 <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="Números separados por coma" />
              </div>
           </div>
           <Button className="w-full h-16 bg-orange-500 rounded-2xl font-black text-white shadow-xl border-b-4 border-orange-700 uppercase">Publicar Regalos</Button>
        </div>
      )}

      {/* 4. AGENCIAS */}
      {adminTab === 'agencias' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8">
             <h3 className="font-black text-2xl md:text-3xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4">
               <Store size={32} /> {editingId ? 'EDITAR' : 'CREAR'} AGENCIA
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg" placeholder="Nombre Agencia" />
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg" placeholder="Pago Móvil" />
                <Input value={formData.rif} onChange={e => setFormData({...formData, rif: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg" placeholder="Cédula / RIF" />
                <Input value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-lg" placeholder="Banco" />
                <div className="md:col-span-2 relative h-40 border-4 border-dashed border-slate-900 rounded-3xl overflow-hidden bg-slate-50">
                   <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain p-2" alt="Preview" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400 font-black uppercase text-xs"><Upload size={40} /> Subir Publicidad (Imagen)</div>}
                </div>
             </div>
             <Button onClick={handleSaveAgencia} className="w-full h-20 bg-emerald-500 rounded-3xl font-black text-white shadow-xl border-b-8 border-emerald-700 text-xl active:scale-95 transition-transform">
               {loading ? "PROCESANDO..." : "GUARDAR AGENCIA"}
             </Button>
             {editingId && <Button variant="outline" onClick={() => {setEditingId(null); setFormData({name:"", phone:"", rif:"", bank:"", ad_image:""}); setPreviewUrl(null);}} className="w-full h-12 rounded-xl font-black">CANCELAR</Button>}
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl space-y-4">
             <h4 className="text-white font-black uppercase italic text-xl border-b border-slate-700 pb-2 flex items-center gap-2"><Database size={20}/> AGENCIAS REGISTRADAS</h4>
             <div className="grid gap-3">
               {agencias.length > 0 ? agencias.map(ag => (
                 <div key={ag.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border-4 border-slate-800 shadow-md">
                    <div>
                      <p className="font-black text-slate-900 uppercase">{ag.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{ag.phone} | {ag.bank}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditAgency(ag)} className="p-2 bg-blue-500 text-white rounded-lg hover:scale-110 transition-transform"><Edit3 size={18}/></button>
                      <button onClick={() => handleDeleteAgency(ag.id)} className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                    </div>
                 </div>
               )) : <p className="text-slate-500 font-black text-center py-4 uppercase">No hay agencias en la base de datos</p>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
