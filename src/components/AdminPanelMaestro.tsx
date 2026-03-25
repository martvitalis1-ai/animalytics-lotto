import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, Key, Upload, Loader2, Trash2, Edit3, 
  ShieldCheck, Gift, Database, Lock, Unlock, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOTTERIES } from '@/lib/constants';

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias'>('resultados');

  // --- ESTADOS PARA ACCESOS ---
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");

  // --- ESTADOS PARA AGENCIAS ---
  const [loading, setLoading] = useState(false);
  const [agencias, setAgencias] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => { 
    if (auth) {
      loadAgencias();
      loadAccessCodes();
    } 
  }, [auth]);

  const loadAccessCodes = async () => {
    // Simulado para el ejemplo, pero aquí va tu fetch a la tabla 'access_codes'
    setAccessCodes([
      { id: 1, code: "GANADOR2026", type: "MAESTRO", status: "active" },
      { id: 2, code: "PRUEBA-01", type: "APP", status: "active" },
      { id: 3, code: "BLOQUEADO-X", type: "APP", status: "blocked" },
    ]);
  };

  const loadAgencias = async () => {
    const { data } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(data || []);
  };

  const handleSaveAgencia = async () => {
    if (!formData.name || !formData.phone || !formData.rif || !formData.bank) return toast.error("Faltan datos");
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
      if (editingId) await supabase.from('agencies').update(payload).eq('id', editingId);
      else await supabase.from('agencies').insert([payload]);
      
      toast.success("GUARDADO");
      setFormData({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setImageFile(null); setPreviewUrl(null); setEditingId(null);
      loadAgencias();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-2xl mt-20">
        <Key size={60} className="text-emerald-600 mb-6" />
        <h2 className="text-slate-900 font-black text-3xl uppercase mb-8 italic tracking-tighter">Panel Maestro</h2>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="border-4 border-slate-900 h-20 rounded-2xl font-black text-center text-4xl mb-8 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-20 rounded-2xl font-black uppercase text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-2xl">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 px-2 animate-in fade-in duration-500">
      {/* NAVEGACIÓN (Bunker Style) */}
      <div className="flex flex-wrap justify-center gap-2 bg-slate-900 p-3 rounded-[3rem] border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.2)] max-w-4xl mx-auto">
        {(['resultados', 'accesos', 'regalos', 'agencias'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[100px] px-4 py-4 rounded-full font-black text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- RESULTADOS --- */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 mx-auto max-w-5xl">
          <ResultsInsert />
        </div>
      )}

      {/* --- ACCESOS (CRUD COMPLETO) --- */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-10 animate-in slide-in-from-bottom-4 mx-auto max-w-5xl">
           <h3 className="font-black text-3xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4 border-slate-50"><ShieldCheck size={32} /> CÓDIGOS DE ACCESO APP</h3>
           <div className="flex gap-4">
              <Input value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-xl" placeholder="NUEVO CÓDIGO" />
              <Button onClick={() => {toast.success("CÓDIGO CREADO"); setNewCode("")}} className="bg-emerald-500 h-16 px-10 rounded-2xl font-black text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">Crear</Button>
           </div>
           
           <div className="space-y-4">
              {accessCodes.map(ac => (
                <div key={ac.id} className={`p-5 border-4 border-slate-900 rounded-2xl flex justify-between items-center ${ac.status === 'blocked' ? 'bg-slate-100 opacity-60' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                   <div className="flex flex-col">
                      <span className="font-black text-xl tracking-tighter">{ac.code}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ac.type} | {ac.status === 'active' ? 'ACTIVO' : 'BLOQUEADO'}</span>
                   </div>
                   <div className="flex gap-3">
                      <button className="p-3 bg-blue-500 text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Edit3 size={20}/></button>
                      <button className={`p-3 text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${ac.status === 'active' ? 'bg-orange-500' : 'bg-slate-900'}`}>{ac.status === 'active' ? <Lock size={20}/> : <Unlock size={20}/>}</button>
                      <button className="p-3 bg-red-500 text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={20}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- REGALOS (TODAS LAS LOTERÍAS) --- */}
      {adminTab === 'regalos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-10 animate-in slide-in-from-bottom-4 mx-auto max-w-5xl">
           <h3 className="font-black text-3xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4 border-slate-50"><Gift size={32} /> ANIMALES REGALO</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                 <label className="font-black text-xs uppercase text-slate-500 ml-2">Seleccionar Lotería</label>
                 <Select defaultValue="lotto_activo">
                    <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-4 border-slate-900">
                       {LOTTERIES.map(l => (
                         <SelectItem key={l.id} value={l.id} className="font-black uppercase py-2">{l.name}</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <label className="font-black text-xs uppercase text-slate-500 ml-2">Animales (Ej: 12, 05, 33)</label>
                 <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="Escribe los números..." />
              </div>
           </div>
           <Button className="w-full h-20 bg-orange-500 hover:bg-orange-400 rounded-3xl font-black text-white border-4 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase italic">Publicar Regalos</Button>
        </div>
      )}

      {/* --- AGENCIAS --- */}
      {adminTab === 'agencias' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 mx-auto max-w-5xl">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-10">
             <h3 className="font-black text-3xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4 border-slate-50"><Store size={32} /> {editingId ? 'EDITAR' : 'CREAR'} AGENCIA</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="Nombre Agencia" />
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="Pago Móvil" />
                <Input value={formData.rif} onChange={e => setFormData({...formData, rif: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="Cédula / RIF" />
                <Input value={formData.bank} onChange={e => setFormData({...formData, bank: e.target.value})} className="border-4 border-slate-900 h-16 rounded-2xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" placeholder="Banco" />
                <div className="md:col-span-2 relative h-48 border-4 border-dashed border-slate-900 rounded-[2rem] overflow-hidden bg-slate-50">
                   <Input type="file" accept="image/*" onChange={e => {const f=e.target.files?.[0]; if(f){setImageFile(f); setPreviewUrl(URL.createObjectURL(f))}}} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                   {previewUrl ? <img src={previewUrl} className="w-full h-full object-contain p-2" /> : <div className="flex flex-col items-center justify-center h-full text-slate-400 font-black uppercase"><Upload size={48} /> Subir Publicidad</div>}
                </div>
             </div>
             <Button onClick={handleSaveAgencia} className="w-full h-20 bg-emerald-500 border-4 border-slate-900 rounded-3xl font-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase italic">{loading ? "PROCESANDO..." : "GUARDAR AGENCIA"}</Button>
          </div>

          <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl space-y-4">
             <h4 className="text-white font-black uppercase italic text-2xl border-b-4 border-emerald-500 pb-2 flex items-center gap-2"><Database size={24}/> AGENCIAS REGISTRADAS</h4>
             <div className="grid gap-4">
               {agencias.map(ag => (
                 <div key={ag.id} className="bg-white p-6 rounded-2xl flex justify-between items-center border-4 border-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    <div>
                      <p className="font-black text-2xl text-slate-900 uppercase tracking-tighter italic">{ag.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">{ag.phone} | {ag.bank}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEditAgency(ag)} className="p-3 bg-blue-500 text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Edit3 size={20}/></button>
                      <button onClick={() => {if(confirm('¿Borrar?')) supabase.from('agencies').delete().eq('id',ag.id).then(()=>loadAgencias())}} className="p-3 bg-red-500 text-white rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={20}/></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
