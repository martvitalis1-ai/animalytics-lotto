import { useState } from 'react';
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { Button } from "@/components/ui/button";

export function ModuloJugadas({ tenantAgency }: any) {
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const agencies = ["Agencia Central", "Agencia El Rey", "Agencia La Suerte"];
  const [activeAgency, setActiveAgency] = useState(agencies[0]);

  const AD_URL = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/banner-promo.jpg";

  // 🛡️ MAPEO DE LOGOS FIJO - CERO REPETICIONES - CERO ERRORES
  const getFixedLotteryLogo = (id: string) => {
    const baseUrl = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/";
    const logos: Record<string, string> = {
      granjita: `${baseUrl}lotto-granjita.png`,
      la_granjita: `${baseUrl}lotto-granjita.png`,
      lotto_activo: `${baseUrl}lotto-activo.png`,
      guacharo: `${baseUrl}lotto-guacharo.png`,
      el_guacharo: `${baseUrl}lotto-guacharo.png`,
      guacharito: `${baseUrl}lotto-guacharito.png`,
      selva_plus: `${baseUrl}lotto-selvaplus.png`,
      lotto_rey: `${baseUrl}lotto-rey.png`
    };
    return logos[id] || logos['lotto_activo'];
  };

  const animalCodes = getCodesForLottery(selectedLottery);

  return (
    <div className="space-y-10 pb-40 px-2">
      {/* 1. NOMBRES DE AGENCIAS */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
         {agencies.map(name => (
           <button key={name} onClick={() => setActiveAgency(name)} className={`px-6 py-2 rounded-full font-black uppercase text-xs shrink-0 ${activeAgency === name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
             {name}
           </button>
         ))}
      </div>

      <div className="grid gap-3">
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg">Tu Banco</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg">Pago Móvil</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg">Cédula</Button>
      </div>

      {/* 2. SELECTOR DE LOTERÍAS - CORREGIDO: FONDO NEGRO Y LOGOS CORRECTOS */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl">
         <div className="flex justify-center flex-wrap gap-4">
            {['la_granjita', 'lotto_activo', 'el_guacharo', 'guacharito', 'selva_plus', 'lotto_rey'].map(lot => (
              <button 
                key={lot} 
                onClick={() => setSelectedLottery(lot === 'la_granjita' ? 'granjita' : lot === 'el_guacharo' ? 'guacharo' : lot)} 
                className={`p-1 rounded-full transition-all bg-black shadow-lg ${
                  (selectedLottery === lot || (selectedLottery === 'granjita' && lot === 'la_granjita') || (selectedLottery === 'guacharo' && lot === 'el_guacharo')) 
                  ? 'ring-4 ring-emerald-500 scale-110' 
                  : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                }`}
              >
                 <img 
                    src={getFixedLotteryLogo(lot)} 
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full object-contain p-1" 
                    alt={lot}
                 />
              </button>
            ))}
         </div>
      </div>

      {/* 3. GRILLA DE ANIMALES */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-8 shadow-2xl">
         <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {animalCodes.map(code => (
              <div 
                key={code} 
                onClick={() => setSelectedAnimals(prev => prev.includes(code) ? prev.filter(a => a!==code) : [...prev, code])}
                className={`relative flex flex-col items-center p-2 rounded-3xl border-4 transition-all cursor-pointer ${selectedAnimals.includes(code) ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-lg' : 'border-slate-50 bg-white opacity-90'}`}
              >
                <img src={getAnimalImageUrl(code)} className="w-20 h-20 md:w-32 md:h-32 object-contain" />
              </div>
            ))}
         </div>
      </div>

      <div className="space-y-6">
         <Button className="w-full h-20 bg-slate-900 text-white rounded-[2rem] font-black text-2xl uppercase border-b-8 border-slate-700 active:scale-95 transition-all">
           Enviar Jugada
         </Button>
         
         <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img src={AD_URL} className="w-full h-auto object-cover" alt="Publicidad" />
         </div>
      </div>
    </div>
  );
}
