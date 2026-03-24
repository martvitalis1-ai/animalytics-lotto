import { useState } from 'react';
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { getLotteryLogo } from './LotterySelector';
import { Button } from "@/components/ui/button";

export function ModuloJugadas({ tenantAgency }: any) {
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const agencies = ["Agencia Central", "Agencia El Rey", "Agencia La Suerte"];
  const [activeAgency, setActiveAgency] = useState(agencies[0]);

  // PUBLICIDAD ABAJO
  const AD_URL = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/banner-promo.jpg";

  // FIX: Lógica de 36, 75 y 99 animales según lotería
  const animalCodes = getCodesForLottery(selectedLottery);

  return (
    <div className="space-y-10 pb-40">
      {/* 1. NOMBRES DE AGENCIAS */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
         {agencies.map(name => (
           <button key={name} onClick={() => setActiveAgency(name)} className={`px-6 py-2 rounded-full font-black uppercase text-xs shrink-0 ${activeAgency === name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
             {name}
           </button>
         ))}
      </div>

      <div className="grid gap-3">
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700">Tu Banco</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700">Pago Móvil</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700">Cédula</Button>
      </div>

      {/* 2. LOGOS DE LOTERÍAS EN CÍRCULOS NEGROS */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl">
         <div className="flex justify-center flex-wrap gap-4">
            {['la_granjita', 'lotto_activo', 'el_guacharo', 'guacharito', 'selva_plus', 'lotto_rey'].map(lot => (
              <button key={lot} onClick={() => setSelectedLottery(lot)} className={`p-1.5 rounded-full ring-4 transition-all ${selectedLottery === lot ? 'ring-emerald-500 bg-slate-900' : 'ring-transparent bg-black opacity-50'}`}>
                 <img src={getLotteryLogo(lot)} className="w-12 h-12 md:w-16 md:h-16 rounded-full object-contain bg-white" />
              </button>
            ))}
         </div>
      </div>

      {/* 3. GRILLA DINÁMICA DE ANIMALES (75 o 99) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-8 shadow-2xl">
         <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {animalCodes.map(code => (
              <div 
                key={code} 
                onClick={() => setSelectedAnimals(prev => prev.includes(code) ? prev.filter(a => a!==code) : [...prev, code])}
                className={`relative flex flex-col items-center p-2 rounded-3xl border-4 transition-all cursor-pointer ${selectedAnimals.includes(code) ? 'border-emerald-500 bg-emerald-50 scale-110' : 'border-slate-50 bg-white'}`}
              >
                <img src={getAnimalImageUrl(code)} className="w-16 h-16 md:w-24 md:h-24 object-contain" />
              </div>
            ))}
         </div>
      </div>

      {/* 4. BOTÓN Y PUBLICIDAD ABAJO */}
      <div className="space-y-6">
         <Button className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-2xl uppercase border-b-8 border-slate-700">Enviar Jugada</Button>
         <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img src={AD_URL} className="w-full h-auto object-cover" alt="Publicidad" />
         </div>
      </div>
    </div>
  );
}
