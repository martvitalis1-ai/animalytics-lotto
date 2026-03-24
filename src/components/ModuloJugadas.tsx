// Dentro de src/components/ModuloJugadas.tsx
// Reemplace la Card que contiene filteredNumbers.map con este bloque:

<Card className="p-4 md:p-10 bg-white border-4 border-slate-900 rounded-[4rem] shadow-2xl overflow-hidden">
  <div className="flex justify-between items-center mb-10 px-4">
     <h3 className="font-black uppercase italic text-2xl text-slate-800">Seleccione su Jugada</h3>
     <div className="bg-emerald-500 text-white px-4 py-1 rounded-full font-black text-[10px] animate-pulse">
        SISTEMA 3D ACTIVO
     </div>
  </div>

  {/* 🛡️ REJILLA OPTIMIZADA: Animales más grandes y sin textos redundantes */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-10">
    {filteredNumbers.map(n => (
      <button 
        key={n} 
        onClick={() => setSelectedNum(n)} 
        className={`flex flex-col items-center justify-center p-2 rounded-[3.5rem] border-4 transition-all aspect-square relative group ${
          selectedNum === n 
          ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-[0_20px_50px_rgba(16,185,129,0.4)] z-20' 
          : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
        }`}
      >
        {/* IMAGEN REALMENTE GRANDE */}
        <img 
          src={getAnimalImageUrl(n)} 
          className="w-full h-full object-contain transition-transform group-hover:rotate-6" 
          alt={n} 
        />
        
        {/* Marcador de selección discreto */}
        {selectedNum === n && (
          <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-2 rounded-full border-2 border-white shadow-lg">
            <CheckCircle2 size={16} />
          </div>
        )}
      </button>
    ))}
  </div>
</Card>
