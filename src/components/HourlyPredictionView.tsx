import { useMemo } from 'react';
import { getAnimalImageUrl } from '@/lib/animalData';

export function AIPredictive({ lotteryId }: { lotteryId: string }) {
  // Lógica simulada de estados (Esto se alimenta de tu history de Supabase)
  const statusGroups = [
    { title: "🔥 CALIENTES", color: "bg-orange-500", animals: ["25", "04", "02"] },
    { title: "❄️ FRÍOS", color: "bg-blue-500", animals: ["33", "10", "08"] },
    { title: "🔒 ENJAULADOS", color: "bg-slate-900", animals: ["00", "15", "22"] }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
          <h3 className={`text-center py-1 px-4 rounded-full text-white text-xs font-black mb-6 ${group.color} inline-block mx-auto w-full`}>
            {group.title}
          </h3>
          <div className="flex justify-around gap-2">
            {group.animals.map((code) => (
              <div key={code} className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-2">
                  <img src={getAnimalImageUrl(code)} className="w-16 h-16 object-contain" />
                </div>
                <span className="text-[10px] font-black bg-slate-50 px-2 py-0.5 rounded text-slate-400">#{code}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* SECCIÓN RECOMENDACIÓN DEL SISTEMA */}
      <div className="md:col-span-3 bg-primary/5 rounded-[2.5rem] p-8 border-2 border-dashed border-primary/20 text-center">
        <h4 className="font-black text-primary mb-2 italic">🎯 RECOMENDACIÓN MAESTRA</h4>
        <p className="text-sm font-bold text-slate-600">El sistema detecta una alta frecuencia en la familia de los <span className="text-primary font-black">REPTILES</span> para las próximas 3 horas.</p>
      </div>
    </div>
  );
}
