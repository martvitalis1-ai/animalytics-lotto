import { useState, useEffect } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Store, Key, Upload, Loader2, Trash2, Edit3, 
  ShieldCheck, Gift, Database, Megaphone, ImageIcon, Lock, Unlock, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LOTTERIES } from '@/lib/constants';

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'regalos' | 'agencias' | 'publicidad'>('resultados');
  const [loading, setLoading] = useState(false);

  // --- ESTADOS DE DATOS ---
  const [agencias, setAgencias] = useState<any[]>([]);
  const [adsData, setAdsData] = useState<Record<string, string>>({});
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  
  // --- ESTADOS DE FORMULARIOS ---
  const [newCode, setNewCode] = useState("");
  const [newAlias, setNewAlias] = useState("");
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);
  const [agencyForm, setAgencyForm] = useState({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Cargar todo al entrar
  useEffect(() => { 
    if (auth) {
      loadAllData();
    } 
  }, [auth, adminTab]);

  const loadAllData = async () => {
    // 1. Cargar Agencias
    const { data: ag } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(ag || []);

    // 2. Cargar Publicidad
    const { data: ads } = await supabase.from('ads').select('*');
    const mappedAds = (ads || []).reduce((acc: any, ad: any) => ({ ...acc, [ad.id]: ad.image_url }), {});
    setAdsData(mappedAds);

    // 3. Cargar Accesos
    const { data: codes } = await supabase.from('access_codes').select('*').order('created_at', { ascending: false });
    setAccessCodes(codes || []);
  };

  // --- LÓGICA DE ACCESOS ---
  const handleCreateCode = async () => {
    if (!newCode.trim()) return toast.error("Escribe un código");
    setLoading(true);
    try {
      const { error } = await supabase.from('access_codes').insert([{ 
        code: newCode.trim().toUpperCase(), is_active: true, role: 'user', alias: newAlias.trim() || null 
      }]);
      if (error) throw error;
      toast.success("CÓDIGO CREADO");
      setNewCode(""); setNewAlias(""); loadAllData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const handleDeleteCode = async (code: string) => {
    if (code === 'GANADOR2026') return toast.error("No puedes borrar el maestro");
    if (!confirm("¿Borrar?")) return;
    await supabase.from('access_codes').delete().eq('code', code);
    loadAllData();
  };

  // --- LÓGICA DE PUBLICIDAD ---
  const handleUploadAd = async (slot: string, file: File) => {
    setLoading(true);
    try {
      const fileName = `ads/${slot}-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('ANIMALITOS').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
      await supabase.from('ads').upsert({ id: slot, image_url: urlData.publicUrl });
      toast.success("BANNER ACTUALIZADO");
      loadAllData();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  // --- LÓGICA DE AGENCIAS ---
  const handleSaveAgencia = async () => {
    if (!agencyForm.name || !agencyForm.phone) return toast.error("Faltan datos");
    setLoading(true);
    try {
      if (editingAgencyId) await supabase.from('agencies').update(agencyForm).eq('id', editingAgencyId);
      else await supabase.from('agencies').insert([agencyForm]);
      toast.success("AGENCIA GUARDADA");
      setAgencyForm({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setEditingAgencyId(null);
      loadAllData();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  if (!auth) {
    return (
      <div className="p-10 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mx-auto max-w-md mt-20">
        <Key size={50} className="text-emerald-600 mb-4" />
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" placeholder="CÓDIGO" />
        <Button onClick={() => pass.trim() === 'GANADOR2026' ? setAuth(true) : toast.error("DENEGADO")} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 px-1 animate-in fade-in duration-500">
      {/* 🛡️ NAVEGACIÓN PRINCIPAL: ÓVALO NEGRO */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2.5 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-5xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias', 'publicidad'].map((tab: any) => (
          <button key={tab} onClick={() => setAdminTab(tab)} className={`flex-1 min-w-[90px] py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105' : 'text-slate-400'}`}>{tab}</button>
        ))}
      </div>

      {/* 1. RESULTADOS */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto"><ResultsInsert /></div>
      )}

      {/* 2. ACCESOS */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4"><ShieldCheck /> CONTROL DE ACCESOS</h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input value={newCode} onChange={e=>setNewCode(e.target.value.toUpperCase())} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="CÓDIGO" />
              <Input value={newAlias} onChange={e=>setNewAlias(e.target.value)} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="ALIAS" />
              <Button onClick={handleCreateCode} disabled={loading} className="bg-emerald-500 h-14 rounded-xl font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">CREAR</Button>
           </div>
           <div className="grid gap-3">
              {accessCodes.map(ac => (
                <div key={ac.code} className={`p-4 border-4 border-slate-900 rounded-2xl flex justify-between items-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${!ac.is_active ? 'opacity-40' : ''}`}>
                   <span className="font-black uppercase">{ac.code} ({ac.alias || 'S/A'})</span>
                   <button onClick={()=>handleDeleteCode(ac.code)} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* 3. REGALOS */}
      {adminTab === 'regalos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4"><Gift /> ANIMALES REGALO</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select><SelectTrigger className="border-4 border-slate-900 h-14 rounded-xl font-black bg-white"><SelectValue placeholder="Lotería" /></SelectTrigger>
              <SelectContent className="bg-white border-4 border-slate-900">{LOTTERIES.map(l=><SelectItem key={l.id} value={l.id} className="font-black uppercase">{l.name}</SelectItem>)}</SelectContent></Select>
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Ej: 12, 05, 33" />
           </div>
           <Button className="w-full h-16 bg-orange-500 rounded-2xl font-black text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-xl">PUBLICAR REGALOS</Button>
        </div>
      )}

      {/* 4. AGENCIAS */}
      {adminTab === 'agencias' && (
        <div className="space-y-10 max-w-5xl mx-auto text-slate-900">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8">
             <h3 className="font-black text-2xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4"><Store /> GESTIÓN AGENCIA</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input value={agencyForm.name} onChange={e=>setAgencyForm({...agencyForm, name:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Nombre" />
                <Input value={agencyForm.phone} onChange={e=>setAgencyForm({...agencyForm, phone:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Pago Móvil" />
                <Input value={agencyForm.rif} onChange={e=>setAgencyForm({...agencyForm, rif:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Cédula" />
                <Input value={agencyForm.bank} onChange={e=>setAgencyForm({...agencyForm, bank:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Banco" />
             </div>
             <Button onClick={handleSaveAgencia} className="w-full h-16 bg-emerald-500 rounded-2xl font-black border-4 border-slate-900 shadow-lg text-xl">GUARDAR AGENCIA</Button>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2.5rem] space-y-4">
             {agencias.map(ag => (
               <div key={ag.id} className="bg-white p-4 rounded-xl flex justify-between items-center border-4 border-slate-800">
                  <span className="font-black uppercase">{ag.name}</span>
                  <div className="flex gap-2">
                    <button onClick={()=>{setEditingAgencyId(ag.id); setAgencyForm(ag);}} className="p-2 bg-blue-500 text-white rounded-lg"><Edit3 size={16}/></button>
                    <button onClick={async()=>{await supabase.from('agencies').delete().eq('id',ag.id); loadAllData();}} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* 5. PUBLICIDAD */}
      {adminTab === 'publicidad' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-10 max-w-5xl mx-auto text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4"><Megaphone /> BANNERS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {['login', 'ia', 'explosivo', 'deportes'].map((slot) => (
                <div key={slot} className="space-y-4 p-5 border-4 border-slate-900 rounded-[2.5rem] bg-slate-50 relative group">
                   <div className="flex justify-between items-center"><label className="font-black text-[10px] uppercase text-slate-500">{slot}</label></div>
                   <div className="relative h-32 w-full border-4 border-slate-900 rounded-2xl overflow-hidden bg-white">
                      {adsData[slot] ? <img src={adsData[slot]} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full opacity-20"><ImageIcon size={32}/></div>}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                         <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-30" onChange={e => {const f=e.target.files?.[0]; if(f) handleUploadAd(slot, f)}} />
                         <Upload className="text-white mb-1" size={24} /><span className="text-white font-black text-[9px] uppercase">Cambiar</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
