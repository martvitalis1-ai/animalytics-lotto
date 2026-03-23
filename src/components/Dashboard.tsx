// Dentro del TabsList, aplicar este estilo para el marcado activo:
<TabsList className="bg-white p-1 rounded-full h-16 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex overflow-x-auto no-scrollbar w-full">
  <TabsTrigger 
    value="ia" 
    className="rounded-full px-6 font-black text-[11px] uppercase transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:scale-110"
  >
    IA
  </TabsTrigger>
  {/* Repetir el estilo para los demás triggers */}
</TabsList>

{/* SECCIÓN DEPORTES (FOTO 10) */}
<TabsContent value="deportes">
  <div className="bg-white border-4 border-slate-900 rounded-[4rem] p-12 shadow-2xl flex flex-col items-center">
    <Trophy size={80} className="text-orange-500 mb-4 animate-bounce" />
    <h2 className="font-black text-4xl uppercase italic text-slate-900">Líneas de Las Vegas</h2>
    <p className="font-bold text-slate-400 mt-2 uppercase tracking-widest">Sincronización en Tiempo Real...</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full">
       <div className="p-6 bg-slate-900 text-white rounded-3xl border-b-4 border-emerald-500 italic font-black">NBA: Lakers vs Celtics (+4.5)</div>
       <div className="p-6 bg-slate-900 text-white rounded-3xl border-b-4 border-orange-500 italic font-black">MLB: Yankees vs Red Sox (O/U 8.5)</div>
    </div>
  </div>
</TabsContent>
