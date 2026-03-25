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
  const [editingAgencyId, setEditingAgencyId] = useState<string | null>(null);
  const [agencyForm, setAgencyForm] = useState({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => { 
    if (auth) {
      loadData();
    } 
  }, [auth, adminTab]);

  const loadData = async () => {
    const { data: ag } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    setAgencias(ag || []);

    const { data: ads } = await supabase.from('ads').select('*');
    const mappedAds = (ads || []).reduce((acc: any, ad: any) => ({ ...acc, [ad.id]: ad.image_url }), {});
    setAdsData(mappedAds);

    // Simulado para visualización de accesos
    setAccessCodes([
      { id: 1, code: "GANADOR2026", status: "active" },
      { id: 2, code: "PRUEBA-VIP", status: "active" }
    ]);
  };

  // --- LÓGICA DE PUBLICIDAD (CARGA DE IMAGEN REAL) ---
  const handleUploadAd = async (slot: string, file: File) => {
    setLoading(true);
    try {
      const fileName = `ads/${slot}-${Date.now()}.${file.name.split('.').pop()}`;
      await supabase.storage.from('ANIMALITOS').upload(fileName, file);
      const { data: urlData } = supabase.storage.from('ANIMALITOS').getPublicUrl(fileName);
      
      await supabase.from('ads').upsert({ id: slot, image_url: urlData.publicUrl });
      toast.success(`BANNER ${slot.toUpperCase()} ACTUALIZADO`);
      loadData();
    } catch (e: any) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  const handleDeleteAd = async (slot: string) => {
    if (!confirm("¿Quitar esta publicidad?")) return;
    await supabase.from('ads').delete().eq('id', slot);
    toast.success("ELIMINADO");
    loadData();
  };

  // --- LÓGICA DE AGENCIAS ---
  const handleSaveAgencia = async () => {
    if (!agencyForm.name || !agencyForm.phone || !agencyForm.rif || !agencyForm.bank) return toast.error("Faltan datos");
    setLoading(true);
    try {
      if (editingAgencyId) await supabase.from('agencies').update(agencyForm).eq('id', editingAgencyId);
      else await supabase.from('agencies').insert([agencyForm]);
      
      toast.success("AGENCIA GUARDADA");
      setAgencyForm({ name: "", phone: "", rif: "", bank: "", ad_image: "" });
      setEditingAgencyId(null);
      loadData();
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
      {/* 🛡️ NAVEGACIÓN PRINCIPAL: ÓVALO NEGRO CON BOTONES BLANCOS */}
      <div className="flex flex-wrap justify-center gap-1.5 bg-slate-900 p-2.5 rounded-[3rem] border-4 border-slate-900 shadow-xl max-w-5xl mx-auto">
        {['resultados', 'accesos', 'regalos', 'agencias', 'publicidad'].map((tab: any) => (
          <button 
            key={tab} 
            onClick={() => setAdminTab(tab)} 
            className={`flex-1 min-w-[90px] py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase transition-all ${adminTab === tab ? 'bg-white text-slate-900 scale-105 shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- 1. PESTAÑA RESULTADOS --- */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto animate-in slide-in-from-bottom-4">
          <ResultsInsert />
        </div>
      )}

      {/* --- 2. PESTAÑA ACCESOS --- */}
      {adminTab === 'accesos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-emerald-600 flex items-center gap-3 border-b-4 pb-4"><ShieldCheck /> CONTROL DE ACCESOS</h3>
           <div className="flex gap-3">
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black text-lg" placeholder="NUEVO CÓDIGO" />
              <Button className="bg-emerald-500 h-14 px-8 rounded-xl font-black border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-slate-900">CREAR</Button>
           </div>
           <div className="grid gap-3">
              {accessCodes.map(ac => (
                <div key={ac.id} className="p-4 border-4 border-slate-900 rounded-2xl flex justify-between items-center bg-slate-50 shadow-sm">
                   <span className="font-black text-lg uppercase tracking-tighter">{ac.code}</span>
                   <div className="flex gap-2">
                      <button className="p-2 bg-blue-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Edit3 size={16}/></button>
                      <button className="p-2 bg-orange-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Lock size={16}/></button>
                      <button className="p-2 bg-red-500 text-white rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* --- 3. PESTAÑA REGALOS --- */}
      {adminTab === 'regalos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4"><Gift /> ANIMALES REGALO</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select><SelectTrigger className="border-4 border-slate-900 h-14 rounded-xl font-black uppercase bg-white"><SelectValue placeholder="Lotería" /></SelectTrigger>
              <SelectContent className="bg-white border-4 border-slate-900">{LOTTERIES.map(l=><SelectItem key={l.id} value={l.id} className="font-black uppercase">{l.name}</SelectItem>)}</SelectContent></Select>
              <Input className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Ej: 12, 05, 33" />
           </div>
           <Button className="w-full h-16 bg-orange-500 rounded-2xl font-black text-white border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase italic text-xl">PUBLICAR REGALOS</Button>
        </div>
      )}

      {/* --- 4. PESTAÑA AGENCIAS --- */}
      {adminTab === 'agencias' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 max-w-5xl mx-auto text-slate-900">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-8">
             <h3 className="font-black text-2xl uppercase italic text-pink-600 flex items-center gap-3 border-b-4 pb-4"><Store /> {editingAgencyId ? 'EDITAR' : 'CREAR'} AGENCIA</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input value={agencyForm.name} onChange={e=>setAgencyForm({...agencyForm, name:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Nombre Agencia" />
                <Input value={agencyForm.phone} onChange={e=>setAgencyForm({...agencyForm, phone:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Pago Móvil" />
                <Input value={agencyForm.rif} onChange={e=>setAgencyForm({...agencyForm, rif:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Cédula / RIF" />
                <Input value={agencyForm.bank} onChange={e=>setAgencyForm({...agencyForm, bank:e.target.value})} className="border-4 border-slate-900 h-14 rounded-xl font-black" placeholder="Banco" />
             </div>
             <Button onClick={handleSaveAgencia} className="w-full h-16 bg-emerald-500 rounded-2xl font-black text-slate-900 border-4 border-slate-900 shadow-lg text-xl uppercase italic">GUARDAR DATOS AGENCIA</Button>
          </div>
          <div className="bg-slate-900 p-6 rounded-[2.5rem] space-y-4 shadow-2xl">
             <h4 className="text-white font-black uppercase text-lg border-b border-slate-700 pb-2">LISTADO DE AGENCIAS</h4>
             {agencias.map(ag => (
               <div key={ag.id} className="bg-white p-4 rounded-xl flex justify-between items-center border-4 border-slate-800">
                  <span className="font-black uppercase">{ag.name}</span>
                  <div className="flex gap-2">
                    <button onClick={()=>{setEditingAgencyId(ag.id); setAgencyForm(ag);}} className="p-2 bg-blue-500 text-white rounded-lg"><Edit3 size={16}/></button>
                    <button onClick={()=>handleDeleteAgency(ag.id)} className="p-2 bg-red-500 text-white rounded-lg"><Trash2 size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- 5. PESTAÑA PUBLICIDAD (CARGA REAL) --- */}
      {adminTab === 'publicidad' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-10 max-w-5xl mx-auto animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-3 border-b-4 pb-4"><Megaphone /> GESTIÓN DE BANNERS</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: 'login', label: '1. Banner Inicio' },
                { id: 'ia', label: '2. Banner Sección IA' },
                { id: 'explosivo', label: '3. Banner Explosivos' },
                { id: 'deportes', label: '4. Banner Deportes' }
              ].map((slot) => (
                <div key={slot.id} className="space-y-4 p-5 border-4 border-slate-900 rounded-[2.5rem] bg-slate-50 relative group shadow-sm">
                   <div className="flex justify-between items-center">
                      <label className="font-black text-[10px] uppercase text-slate-500">{slot.label}</label>
                      {adsData[slot.id] && <button onClick={()=>handleDeleteAd(slot.id)} className="text-red-500"><Trash2 size={16}/></button>}
                   </div>
                   <div className="relative h-32 w-full border-4 border-slate-900 rounded-2xl overflow-hidden bg-white shadow-inner">
                      {adsData[slot.id] ? <img src={adsData[slot.id]} className="w-full h-full object-cover" alt="Ad" /> : <div className="flex flex-col items-center justify-center h-full opacity-20"><ImageIcon size={32}/><span className="text-[8px] font-black uppercase">Vacío</span></div>}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                         <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-30" onChange={e => {const f=e.target.files?.[0]; if(f) handleUploadAd(slot.id, f)}} />
                         <Upload className="text-white mb-1" size={24} />
                         <span className="text-white font-black text-[9px] uppercase">Cambiar Imagen</span>
                      </div>
                      {loading && <div className="absolute inset-0 bg-white/80 z-40 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>}
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
