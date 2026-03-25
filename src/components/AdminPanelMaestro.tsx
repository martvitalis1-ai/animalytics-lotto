import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, Key, Upload, Loader2, CheckCircle2, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  // ESTADOS PARA LA AGENCIA
  const [loading, setLoading] = useState(false);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", phone: "", rif: "", bank: "", ad_image: ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { if (auth) loadAgencias(); }, [auth]);

  const loadAgencias = async () => {
    const { data } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(data || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres borrar esta agencia?")) return;
    await supabase.from('agencies').delete().eq('id', id);
    toast.success("AGENCIA ELIMINADA");
    loadAgencias();
  };

  const handleEdit = (agency: any) => {
    setEditingId(agency.id);
    setFormData({
      name: agency.name, phone: agency.phone, rif: agency.rif, bank: agency.bank, ad_image: agency.ad_image
    });
    setPreviewUrl(agency.ad_image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAgencia = async () => {
    if (!formData.name || !formData.phone || !formData.rif || !formData.bank) {
      return toast.error("Faltan datos obligatorios");
    }

    setLoading(true);
    try {
      let finalImageUrl = formData.ad_image;

      if (imageFile) {
        const fileName = `publicidad/${Date.now()}-${imageFile.name}`;
        const { error: upError } = await supabase.storage.from('ANIMALITOS').upload(fileName, imageFile);
        if (upError) throw upError;
        const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = { ...formData, ad_image: finalImageUrl };

      if (editingId) {
        await supabase.from('agencies').update(payload).eq('id', editingId);
        toast.success("AGENCIA ACTUALIZADA");
      } else {
        await supabase.from('agencies').insert([payload]);
        toast.success("AGENCIA CREADA");
      }

      setFormData({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setImageFile(null); setPreviewUrl(null); setEditingId(null);
      loadAgencias();
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10">
        <Key size={60} className="text-emerald-600 mb-6" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="bg-white border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-slate-900 text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 px-2">
      <div className="flex flex-wrap justify-center gap-1.5 bg-white p-3 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-4xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias'].map((tab: any) => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 min-w-[80px] px-3 py-3 rounded-full font-black text-[9px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{tab}</button>
        ))}
      </div>

      {adminTab === 'agencias' && (
        <div className="space-y-10">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-2xl space-y-8 animate-in slide-in-from-bottom-4">
             <h3 className="font-black text-2xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4"><Store /> {editingId ? 'EDITAR' : 'CREAR'} AGENCIA</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black" placeholder="Nombre de Agencia" />
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black" placeholder="Pago Móvil" />
                <Input value={formData.rif} onChange={e => setFormData({...formData, rif: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black" placeholder="Cédula / RIF" />
                <Input value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black" placeholder="Banco" />
                <div className="md:col-span-2 relative h-40 border-4 border-dashed border-slate-900 rounded-3xl overflow-hidden">
                   <Input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain p-2" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400 font-black uppercase text-xs"><Upload size={40} /> Toca para subir Publicidad</div>}
                </div>
             </div>
             <Button onClick={handleSaveAgencia} className="w-full h-20 bg-emerald-500 rounded-3xl font-black text-white shadow-xl border-b-8 border-emerald-700 text-xl">{loading ? "PROCESANDO..." : "GUARDAR AGENCIA"}</Button>
             {editingId && <Button variant="outline" onClick={() => {setEditingId(null); setFormData({name:"", phone:"", rif:"", bank:"", ad_image:""}); setPreviewUrl(null);}} className="w-full">CANCELAR EDICIÓN</Button>}
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl space-y-4">
             <h4 className="text-white font-black uppercase italic text-xl border-b border-slate-700 pb-2">LISTADO DE AGENCIAS REALES</h4>
             {agencias.map(ag => (
               <div key={ag.id} className="bg-white p-4 rounded-2xl flex justify-between items-center border-4 border-slate-800">
                  <div>
                    <p className="font-black text-slate-900 uppercase">{ag.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{ag.phone} - {ag.bank}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(ag)} className="p-2 bg-blue-500 text-white rounded-lg"><Edit3 size={18}/></button>
                    <button onClick={() => handleDelete(ag.id)} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={18}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
