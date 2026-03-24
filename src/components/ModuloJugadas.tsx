import { useState } from 'react';
import { getAnimalImageUrl, getCodesForLottery } from '../lib/animalData';
import { getLotteryLogo } from './LotterySelector'; // 🛡️ Usamos tu función interna que sí funciona
import { Button } from "@/components/ui/button";

export function ModuloJugadas({ tenantAgency }: any) {
  // IDs exactos de tu base de datos SQL para que no haya errores de carga
  const [selectedLottery, setSelectedLottery] = useState("lotto_activo");
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const agencies = ["Agencia Central", "Agencia El Rey", "Agencia La Suerte"];
  const [activeAgency, setActiveAgency] = useState(agencies[0]);

  const AD_URL = "https://raw.githubusercontent.com/martvitalis1-ai/animalytics-lotto/main/src/assets/banner-promo.jpg";

  // Lista única de las 6 loterías basada en tu SQL
  const lotteries = [
    { id: 'granjita', name: 'La Granjita' },
    { id: 'lotto_activo', name: 'Lotto Activo' },
    { id: 'guacharo', name: 'El Guacharo' },
    { id: 'guacharito', name: 'Guacharito' },
    { id: 'selva_plus', name: 'Selva Plus' },
    { id: 'lotto_rey', name: 'Lotto Rey' }
  ];

  const animalCodes = getCodesForLottery(selectedLottery);

  return (
    <div className="space-y-10 pb-40 px-2">
      {/* 1. NOMBRES DE AGENCIAS */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl flex gap-2 overflow-x-auto no-scrollbar">
         {agencies.map(name => (
           <button 
             key={name} 
             onClick={() => setActiveAgency(name)} 
             className={`px-6 py-2 rounded-full font-black uppercase text-xs shrink-0 transition-all ${activeAgency === name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
           >
             {name}
           </button>
         ))}
      </div>

      <div className="grid gap-3">
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg hover:bg-emerald-400">Tu Banco</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg hover:bg-emerald-400">Pago Móvil</Button>
         <Button className="h-14 bg-emerald-500 rounded-2xl font-black uppercase border-b-4 border-emerald-700 text-slate-900 text-lg hover:bg-emerald-400">Cédula</Button>
      </div>

      {/* 2. SELECTOR DE LOTERÍAS - FONDO NEGRO SÓLIDO Y LOGOS VERIFICADOS */}
      <div className="bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 shadow-xl">
         <div className="flex justify-center flex-wrap gap-4">
            {lotteries.map(lot => (
              <button 
                key={lot.id} 
                onClick={() => setSelectedLottery(lot.id)} 
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all bg-black shadow-2xl overflow-hidden border-4 ${
                  selectedLottery === lot.id 
                  ? 'border-emerald-500 scale-110' 
                  : 'border-slate-800'
                }`}
              >
                 <img 
                    src={getLotteryLogo(lot.id)} 
                    className={`w-full h-full object-contain p-2 transition-all ${selectedLottery === lot.id ? 'opacity-100' : 'grayscale opacity-60'}`}
                    alt="" 
                 />
              </button>
            ))}
         </div>
      </div>

      {/* 3. GRILLA DE ANIMALES (75/99 DINÁMICO) */}
      <div className="bg-white border-4 border-slate-900 rounded-[3rem] p-4 md:p-8 shadow-2xl">
         <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {animalCodes.map(code => (
              <div 
                key={code} 
                onClick={() => setSelectedAnimals(prev => prev.includes(code) ? prev.filter(a => a!==code) : [...prev, code])}
                className={`relative flex flex-col items-center p-2 rounded-3xl border-4 transition-all cursor-pointer ${selectedAnimals.includes(code) ? 'border-emerald-500 bg-emerald-50 scale-105 shadow-lg' : 'border-slate-50 bg-white opacity-90'}`}
              >
                <img src={getAnimalImageUrl(code)} className="w-20 h-20 md:w-32 md:h-32 object-contain" alt="" />
              </div>
            ))}
         </div>
      </div>

      {/* BOTÓN ENVIAR Y PUBLICIDAD */}
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
