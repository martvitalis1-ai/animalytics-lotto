import { useMemo } from 'react';
import { Card } from "./ui/card";
import { RichAnimalCard } from "./RichAnimalCard";
import { Grid3X3 } from "lucide-react";

export function SequenceMatrixView({ lotteryId }: { lotteryId: string }) {
  // Lógica de datos simulada para el ejemplo, pero conectada a sus imágenes
  const samples = ["00", "0", "01", "15", "22", "31"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Grid3X3 className="text-emerald-500" />
        <h3 className="font-black text-xl uppercase italic">Matriz de Secuencia (Sucesores)</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {samples.map((code) => (
          <div key={code} className="bg-white p-6 rounded-[3.5rem] border border-slate-100 shadow-xl flex flex-col items-center">
            {/* CABECERA DE LA CARTA */}
            <div className="w-full flex justify-between items-center mb-4 px-4">
               <span className="text-[10px] font-black text-slate-300 uppercase italic">Referencia</span>
               <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">100% ANALIZADO</span>
            </div>

            {/* IMAGEN 3D XL */}
            <RichAnimalCard code={code} size="xl" />

            {/* SUB-SECUENCIA MINIMALISTA */}
            <div className="mt-8 w-full bg-slate-50 p-4 rounded-[2rem] grid grid-cols-3 gap-2">
               {["05", "10", "12"].map(sub => (
                 <div key={sub} className="flex flex-col items-center">
                    <img src={`https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${sub}.png`} className="w-12 h-12 object-contain" alt=""/>
                    <span className="text-[8px] font-black text-emerald-600 mt-1">25%</span>
                 </div>
               ))}
            </div>
          </div>
        ))}
        // Lógica de cálculo real
history.forEach((draw, index) => {
  if (index > 0) {
    const current = draw.result_number;
    const previous = history[index - 1].result_number;
    // Si salió X, el siguiente fue Y...
  }
});

// Diseño de la Matriz de Secuencia
<div className="bg-white p-6 rounded-[3.5rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
  <h3 className="font-black text-2xl uppercase italic mb-6">Matriz de Sucesores (Secuencia)</h3>
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {allAnimals.map(code => (
       <div key={code} className="p-4 bg-slate-50 rounded-[2rem] border border-slate-200 flex items-center gap-4">
          <img src={getAnimalImageUrl(code)} className="w-16 h-16" />
          <div className="flex-1">
             <p className="text-[10px] font-black text-slate-400 uppercase">Suele atraer a:</p>
             <div className="flex gap-2 mt-1">
                {/* Los 3 sucesores más probables */}
                <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-black">#05 (30%)</span>
             </div>
          </div>
       </div>
    ))}
  </div>
</div>
      </div>
    </div>
  );
}
