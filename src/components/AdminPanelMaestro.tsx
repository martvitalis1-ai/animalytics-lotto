import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOTTERIES } from '@/lib/constants';
import { Database, ShieldCheck, Gift, Image as ImageIcon, Key, Users, Trash2, Lock, Unlock, Edit3, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

export function AdminPanelMaestro({ userRole }: { userRole?: string }) {
  // 🛡️ Si el rol es admin (GANADOR2026), entra directo
  const [auth, setAuth] = useState(userRole === 'admin');
  const [pass, setPass] = useState("");
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'explosivos'>('resultados');
  const [targetLottery, setTargetLottery] = useState("lotto_activo");

  // 🛡️ ESTADOS PARA GESTIÓN DE CÓDIGOS
  const [appCodes, setAppCodes] = useState([
    { id: 1, code: "ADMIN-2026", status: "active", isEditing: false },
    { id: 2, code: "SOCIO-VIP", status: "blocked", isEditing: false }
  ]);

  const [vipCodes, setVipCodes] = useState([
    { id: 1, code: "VIP-MAESTRO-01", status: "active", isEditing: false }
  ]);

  const handleAuthManual = () => {
    if (pass.trim() === 'GANADOR2026') {
      setAuth(true);
      toast.success("BÚNKER DESBLOQUEADO");
    } else {
      toast.error("CÓDIGO DENEGADO");
    }
  };

  // 🛠️ ACCIONES DE MANDO
  const deleteCode = (id: number, type: 'app' | 'vip') => {
    if (type === 'app') setAppCodes(appCodes.filter(c => c.id !== id));
    else setVipCodes(vipCodes.filter(c => c.id !== id));
    toast.error("Código eliminado permanentemente");
  };

  const toggleStatus = (id: number, type: 'app' | 'vip') => {
    const update = (list: any[]) => list.map(c => 
      c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c
    );
    if (type === 'app') setAppCodes(update(appCodes));
    else setVipCodes(update(vipCodes));
    toast.info("Estado de acceso actualizado");
  };

  const saveEdit = (id: number, type: 'app' | 'vip', newText: string) => {
    const update = (list: any[]) => list.map(c => 
      c.id === id ? { ...c, code: newText.toUpperCase(), isEditing: false } : c
    );
    if (type === 'app') setAppCodes(update(appCodes));
    else setVipCodes(update(vipCodes));
    toast.success("Código actualizado");
  };

  if (!auth) {
    return (
      <div className="p-10 md:p-20 flex flex-col items-center bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl mx-auto max-w-2xl mt-10 text-slate-900 font-sans">
        <Key size={60} className="text-emerald-500 mb-6" />
        <h2 className="font-black text-2xl uppercase mb-6 italic text-center">Panel Maestro</h2>
        <Input 
          type="password" 
          value={pass} 
          onChange={e => setPass(e.target.value)} 
          className="border-4 border-slate-900 h-16 rounded-2xl font-black text-center text-2xl mb-6 shadow-inner" 
          placeholder="CÓDIGO" 
        />
        <Button onClick={handleAuthManual} className="bg-emerald-500 w-full h-16 rounded-2xl font-black uppercase text-slate-900 shadow-xl border-2 border-slate-900 hover:bg-emerald-600">Entrar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      {/* MENÚ SUPERIOR ADMIN */}
      <div className="flex justify-center gap-4 bg-white p-2 rounded-full border-4 border-slate-900 shadow-xl max-w-2xl mx-auto">
        <button onClick={() => setAdminTab('resultados')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'resultados' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Resultados</button>
        <button onClick={() => setAdminTab('accesos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'accesos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Accesos y VIP</button>
        <button onClick={() => setAdminTab('explosivos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'explosivos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Regalos</button>
      </div>

      {/* 1. RESULTADOS */}
      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-4">
          <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-8 text-slate-800"><Database className="text-emerald-500" /> Insertar Sorteos Oficiales</h3>
          <ResultsInsert />
        </div>
      )}
      
      {/* 2. ACCESOS Y VIP (EDITAR, BLOQUEAR, BORRAR) */}
      {adminTab === 'accesos' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
          {/* CONTROL APP */}
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
            <h3 className="font-black text-2xl uppercase italic text-emerald-600 mb-8 flex items-center gap-3"><ShieldCheck /> Códigos de Inicio de Sesión (App)</h3>
            <div className="flex gap-4 mb-8">
              <Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="CREAR NUEVO CÓDIGO" />
              <Button className="bg-emerald-500 h-14 px-10 rounded-2xl font-black uppercase text-white shadow-md border-2 border-slate-900">Añadir</Button>
            </div>
            <div className="space-y-4">
              {appCodes.map(c => (
                <div key={c.id} className={`p-4 border-2 border-slate-900 rounded-2xl flex justify-between items-center ${c.status === 'blocked' ? 'bg-red-50 opacity-60' : 'bg-slate-50'}`}>
                  {c.isEditing ? (
                    <Input defaultValue={c.code} onBlur={(e) => saveEdit(c.id, 'app', e.target.value)} className="w-48 font-black bg-white" autoFocus />
                  ) : (
                    <p className={`font-black uppercase ${c.status === 'blocked' ? 'line-through text-red-400' : 'text-slate-700'}`}>{c.code}</p>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => setAppCodes(appCodes.map(x => x.id === c.id ? {...x, isEditing: true} : x))} size="icon" variant="outline" className="border-slate-300"><Edit3 size={18}/></Button>
                    <Button onClick={() => toggleStatus(c.id, 'app')} size="icon" variant="outline" className={c.status === 'active' ? 'text-emerald-500' : 'text-orange-500'}>{c.status === 'active' ? <Unlock size={18}/> : <Lock size={18}/>}</Button>
                    <Button onClick={() => deleteCode(c.id, 'app')} size="icon" variant="outline" className="text-red-500"><Trash2 size={18}/></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROL VIP */}
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
            <h3 className="font-black text-2xl uppercase italic text-orange-500 mb-8 flex items-center gap-3"><Users /> Gestión VIP Agencias</h3>
            <div className="space-y-4">
              {vipCodes.map(c => (
                <div key={c.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center">
                  <p className={`font-black ${c.status === 'blocked' ? 'text-slate-600 line-through' : 'text-orange-400'}`}>{c.code}</p>
                  <div className="flex gap-2">
                    <Button onClick={() => toggleStatus(c.id, 'vip')} size="icon" variant="ghost" className="text-white hover:bg-orange-500/20">{c.status === 'active' ? <Unlock size={18}/> : <Lock size={18}/>}</Button>
                    <Button onClick={() => deleteCode(c.id, 'vip')} size="icon" variant="ghost" className="text-red-400 hover:bg-red-400/20"><Trash2 size={18}/></Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-6">
                <Input className="bg-white/10 border-none text-white font-black" placeholder="NUEVO VIP" />
                <Button className="bg-orange-500 text-slate-900 font-black px-10 rounded-xl">Generar</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. REGALOS POR LOTERÍA */}
      {adminTab === 'explosivos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4 text-slate-900">
           <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-50 pb-4 text-pink-600 flex items-center gap-3"><Gift /> Configuración de Regalos</h3>
           <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase text-slate-400">1. Seleccionar Lotería</label>
                 <Select value={targetLottery} onValueChange={setTargetLottery}>
                    <SelectTrigger className="border-4 border-slate-900 h-16 rounded-2xl font-black bg-slate-50"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-2 border-slate-900">
                       {LOTTERIES.map(l => <SelectItem key={l.id} value={l.id} className="font-black uppercase">{l.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-4">
                 <label className="font-black text-xs uppercase text-slate-400">2. Animales Regalo</label>
                 <Input className="border-4 border-slate-900 h-16 rounded-2xl font-black text-xl" placeholder="Ej: 12, 05, 31" />
              </div>
           </div>
           <Button className="w-full h-20 bg-emerald-500 hover:bg-emerald-600 rounded-[2.5rem] font-black uppercase text-white text-2xl shadow-xl border-2 border-slate-900">
              Publicar en {LOTTERIES.find(l => l.id === targetLottery)?.name}
           </Button>
        </div>
      )}
    </div>
  );
}
