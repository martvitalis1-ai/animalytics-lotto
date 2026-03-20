// --- REPARACIÓN MAESTRA: MATA EL ERROR ROJO ---
  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await supabase
          .from('lottery_results')
          .select('*', { count: 'exact', head: true });
        
        // EL SECRETO: Verificamos que 'response' no sea null antes de leer 'count'
        const total = response?.count ?? 0;
        setTotalResults(Number(total));
      } catch (e) {
        setTotalResults(0);
      }
    };
    loadCount();
  }, []);
