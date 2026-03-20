// ... (importaciones iguales)
export function HourlyPredictionView() {
  // ... (estados y lógica igual)
  
  // MOTOR 3D
  const get3DImage = (code: string) => {
    const str = String(code).trim();
    const final = (str === '0' || str === '00') ? str : str.padStart(2, '0');
    return `https://qfdrmyuuswiubsppyjrt.supabase.co/storage/v1/object/public/ANIMALITOS/${final}.png`;
  };

  return (
    <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden text-slate-900">
      <CardHeader className="pb-2 bg-muted/10 border-b">
        {/* ... header igual ... */}
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-full font-black text-2xl shadow-xl animate-pulse">
            {nextDrawTime} <ChevronRight className="w-6 h-6" /> PRÓXIMO
          </div>
          {nextPrediction?.topPick ? (
            <div className="p-8 rounded-[3.5rem] bg-white border-4 border-slate-100 relative shadow-2xl overflow-hidden flex flex-col items-center">
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-4 flex items-center justify-center">
                <img 
                   src={get3DImage(nextPrediction.topPick.code)} 
                   className="w-full h-full object-contain drop-shadow-2xl z-10 animate-in zoom-in-95 duration-500" 
                   crossOrigin="anonymous" 
                   onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
                <span className="absolute bottom-0 text-[120px] lg:text-[180px] font-black text-emerald-500/5 leading-none">{nextPrediction.topPick.code.padStart(2, '0')}</span>
              </div>
              <h3 className="text-4xl font-black uppercase mt-4 tracking-tighter text-slate-800">{nextPrediction.topPick.name}</h3>
              <div className="mt-8 inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-3xl font-black text-2xl shadow-xl">
                <Zap className="w-7 h-7 fill-yellow-300 text-yellow-300" /> {Math.floor(nextPrediction.topPick.probability)}% ÉXITO
              </div>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center opacity-30 grayscale"><Loader2 className="w-12 h-12 animate-spin mb-4 text-emerald-600" /><p className="font-black uppercase tracking-widest text-sm">Escaneando...</p></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
