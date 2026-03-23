import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Image as ImageIcon, Ticket, Save, Trash2, Plus, Users } from "lucide-react";

export function AdminAgencias() {
  const [giftAnimals, setGiftAnimals] = useState("");
  const [vipCode, setVipCode] = useState("");

  const activeCodes = [
    { code: "VIP010YARGELIN", vence: "22/3/2026" },
    { code: "VIP009LEONV", vence: "21/3/2026" }
  ];

  return (
    <div className="space-y-10">
      {/* 🛡️ MIS CÓDIGOS DE ACCESO (FOTO 8) */}
      <div className="space-y-6">
        <h3 className="font-black text-2xl uppercase italic text-orange-500 flex items-center gap-2">
          <Users /> Mis Códigos de Acceso VIP
        </h3>
        
        <div className="flex gap-4">
          <Input 
            value={vipCode}
            onChange={(e) => setVipCode(e.target.value)}
            placeholder="CREAR NUEVO CÓDIGO" 
            className="bg-slate-800 border-2 border-slate-700 h-14 rounded-2xl font-black text-center text-white"
          />
          <Button className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-black h-14 px-8 rounded-2xl uppercase">
            Generar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCodes.map((c) => (
            <div key={c.code} className="bg-white text-slate-900 p-4 rounded-2xl flex justify-between items-center border-l-8 border-emerald-500 shadow-xl">
              <div>
                <p className="font-black text-sm">{c.code}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expira: {c.vence}</p>
              </div>
              <Button variant="ghost" className="text-red-500"><Trash2 size={18} /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* 🎁 REGALOS Y PIRÁMIDE (FOTO 8) */}
      <div className="bg-white text-slate-900 p-8 rounded-[3rem] border-4 border-slate-900 shadow-2xl space-y-8">
        <h3 className="font-black text-xl uppercase italic border-b-2 pb-4 flex items-center gap-2">
          <Gift className="text-emerald-500" /> Configuración Explosivos y Pirámide
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="font-black text-xs uppercase text-slate-400">Animales de Regalo (Ej: 12, 00, 31)</label>
            <Input 
              value={giftAnimals}
              onChange={(e) => setGiftAnimals(e.target.value)}
              className="border-4 border-slate-900 h-14 rounded-2xl font-black" 
              placeholder="Separados por coma" 
            />
          </div>

          <div className="space-y-4">
            <label className="font-black text-xs uppercase text-slate-400">Cargar Imagen Pirámide/Mapa</label>
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
               <ImageIcon className="text-slate-300 mb-2" size={32} />
               <span className="font-black text-[10px] uppercase text-slate-400 text-center">Subir Archivo de Imagen</span>
            </div>
          </div>
        </div>

        <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase rounded-2xl shadow-lg flex items-center justify-center gap-2">
          <Save /> Actualizar Sección Explosivo
        </Button>
      </div>
    </div>
  );
}
