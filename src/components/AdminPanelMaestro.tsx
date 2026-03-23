import { useState } from 'react';
import { ResultsInsert } from "./ResultsInsert";
import { AdminAgencias } from "./AdminAgencias";
import { Database, ShieldCheck, Gift, Image as ImageIcon, Key, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminPanelMaestro() {
  const [adminTab, setAdminTab] = useState<'resultados' | 'accesos' | 'explosivos'>('resultados');

  return (
    <div className="space-y-10 pb-40 animate-in zoom-in duration-500">
      {/* NAVEGACIÓN ADMIN DEL VIDEO 2 */}
      <div className="flex justify-center gap-4 bg-white p-2 rounded-full border-4 border-slate-900 shadow-xl max-w-2xl mx-auto">
        <button onClick={() => setAdminTab('resultados')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'resultados' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Resultados</button>
        <button onClick={() => setAdminTab('accesos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'accesos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Accesos y VIP</button>
        <button onClick={() => setAdminTab('explosivos')} className={`px-8 py-3 rounded-full font-black text-xs uppercase transition-all ${adminTab === 'explosivos' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Explosivos</button>
      </div>

      {adminTab === 'resultados' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom-4">
          <h3 className="font-black text-2xl uppercase italic flex items-center gap-3 mb-10"><Database className="text-emerald-500" /> Insertar Resultados Oficiales</h3>
          <ResultsInsert />
        </div>
      )}

      {adminTab === 'accesos' && (
        <div className="space-y-10 animate-in slide-in-from-bottom-4">
          <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl">
             <h3 className="font-black text-2xl uppercase italic text-emerald-600 mb-8 flex items-center gap-3"><ShieldCheck /> Códigos de Acceso App</h3>
             <div className="flex gap-4"><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" placeholder="NUEVO CÓDIGO" /><Button className="bg-emerald-500 h-14 px-10 rounded-2xl font-black uppercase text-white shadow-xl">Crear</Button></div>
          </div>
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
             <h3 className="font-black text-2xl uppercase italic text-orange-500 mb-8 flex items-center gap-3"><Key /> Gestión VIP de Agencias</h3>
             <div className="flex gap-4"><Input className="bg-slate-800 border-none text-white h-14 rounded-2xl font-black" placeholder="CÓDIGO VIP" /><Button className="bg-orange-500 text-slate-900 h-14 px-10 rounded-2xl font-black uppercase">Generar</Button></div>
          </div>
        </div>
      )}

      {adminTab === 'explosivos' && (
        <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-10 animate-in slide-in-from-bottom-4">
          <h3 className="font-black text-2xl uppercase italic border-b-4 border-slate-50 pb-4 flex items-center gap-3 text-pink-600"><Gift /> Control de Explosivos y Regalos</h3>
          <div className="grid md:grid-cols-2 gap-10">
             <div className="space-y-4"><label className="font-black text-xs uppercase text-slate-400">3 Animales Regalo (Ej: 12, 05, 31)</label><Input className="border-4 border-slate-900 h-14 rounded-2xl font-black" /></div>
             <div className="space-y-4"><label className="font-black text-xs uppercase text-slate-400">Cargar Pirámide / Mapa</label><div className="border-4 border-dashed border-slate-100 p-10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all"><ImageIcon className="text-slate-200 mb-2" size={40} /><span className="font-black text-[10px] uppercase text-slate-300 text-center">Click para subir JPG/PNG</span></div></div>
          </div>
          <Button className="w-full h-16 bg-emerald-500 rounded-2xl font-black uppercase text-white text-xl shadow-xl">Actualizar Búnker</Button>
        </div>
      )}
    </div>
  );
}
