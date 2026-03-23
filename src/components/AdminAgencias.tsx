import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Gift, Image as ImageIcon, Ticket, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function AdminAgencias() {
  const [giftAnimals, setGiftAnimals] = useState("");
  const [vipCode, setVipCode] = useState("");

  const codes = [
    { code: "VIP010YARGELIN", vence: "22/3/2026" },
    { code: "VIP009LEONV", vence: "21/3/2026" },
    { code: "VIPLUISV", vence: "19/3/2026" }
  ];

  return (
    <div className="space-y-8">
      {/* SECCIÓN CÓDIGOS VIP (FOTO 7) */}
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] border-b-8 border-orange-500 shadow-2xl">
        <h3 className="font-black text-2xl uppercase italic mb-6 text-orange-500 flex items-center gap-2">
          <Ticket /> Bóveda Maestro: Códigos VIP
        </h3>
        
        <div className="flex gap-4 mb-8">
          <Input 
            value={vipCode}
            onChange={(e) => setVipCode(e.target.value)}
            placeholder="Ej: PRO-2026" 
            className="bg-slate-800 border-2 border-slate-700 h-14 rounded-2xl font-black text-center"
          />
          <Button className="bg-orange-500 hover:bg-orange-600 text-slate-900 font-black h-14 px-8 rounded-2xl uppercase">
            Crear Código VIP
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {codes.map((c) => (
            <div key={c.code} className="bg-white text-slate-900 p-4 rounded-2xl flex justify-between items-center shadow-lg border-l-8 border-emerald-500">
              <div>
                <p className="font-black text-sm">{c.code}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Vence: {c.vence}</p>
              </div>
              <Button variant="ghost" className="text-red-500 hover:bg-red-50"><Trash2 size={18} /></Button>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN CONFIGURACIÓN EXPLOSIVOS (FOTO 8) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-black text-xl uppercase italic mb-6 border-b-2 pb-4 flex items-center gap-2">
          <Plus className="text-emerald-500" /> Configuración de Regalos y Pirámide
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="font-black text-xs uppercase text-slate-400">3 Animales de Regalo</label>
            <Input 
              value={giftAnimals}
              onChange={(e) => setGiftAnimals(e.target.value)}
              className="border-4 border-slate-900 h-14 rounded-2xl font-black" 
              placeholder="Ej: 12, 14, 00" 
            />
          </div>

          <div className="space-y-4">
            <label className="font-black text-xs uppercase text-slate-400">Cargar Mapa / Pirámide</label>
            <div className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50">
               <ImageIcon className="text-slate-300 mb-2" size={32} />
               <span className="font-black text-[10px] uppercase text-slate-400">Subir Imagen</span>
            </div>
          </div>
        </div>

        <Button className="w-full mt-8 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase rounded-2xl shadow-lg">
          <Save className="mr-2" /> Guardar Cambios en Explosivos
        </Button>
      </div>
    </div>
  );
}
