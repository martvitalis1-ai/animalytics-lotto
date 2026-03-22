import { getAnimalImageUrl } from '../lib/animalData';
import { Zap, Trophy } from "lucide-react";

export function ExplosiveData({ lotteryId }: { lotteryId: string }) {
  const explosive = ["33", "05", "10"]; // Lógica simulada conectada a imágenes 3D

  return (
    <div className="space-y-10 py-10">
       <div className="flex items-center gap-4 bg-orange-500 text-white p-6 rounded-[3rem] bunker-border glow-orange">
          <Zap size={40} className="fill-white" />
          <div>
            <h2 className="text-3xl font-black uppercase italic leading-none">Animales Explosivos</h2>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-80 italic">Puntos de alta presión en el algoritmo</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {explosive.map((code, i) => (
            <div key={code} className="bg-white p-10 rounded-[4rem] bunker-border glow-orange flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-4 left-4 bg-slate-900 text-white w-12 h-12 rounded-full flex items-center justify-center font-black shadow-xl">
                  <Trophy size={20} className="text-orange-400" />
               </div>
               <img src={getAnimalImageUrl(code)} className="w-64 h-64 object-contain mb-8" />
               <div className="bg-orange-600 text-white px-10 py-3 rounded-full font-black text-2xl shadow-xl italic uppercase">Frecuencia XL</div>
            </div>
          ))}
       </div>
    </div>
  );
}
