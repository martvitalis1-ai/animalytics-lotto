import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, conversationHistory, memoryContext, lottery_type = 'lotto_activo' } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // RAG: Fetch recent results for context
    const today = new Date().toISOString().split('T')[0];
    const [resultsRes, predictionsRes, adminPicksRes] = await Promise.all([
      supabase.from('lottery_results').select('lottery_type, result_number, animal_name, draw_time, draw_date')
        .gte('draw_date', new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0])
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('dato_ricardo_predictions').select('*')
        .eq('prediction_date', today).order('draw_time', { ascending: true }),
      supabase.from('admin_picks').select('*')
        .eq('pick_date', today),
    ]);

    const recentResults = resultsRes.data || [];
    const todayPredictions = predictionsRes.data || [];
    const adminPicks = adminPicksRes.data || [];

    // Build RAG context
    const resultsContext = recentResults.slice(0, 20).map(r =>
      `${r.draw_date} ${r.draw_time} ${r.lottery_type}: ${r.result_number} (${r.animal_name || 'N/A'})`
    ).join('\n');

    const predictionsContext = todayPredictions.map(p =>
      `${p.lottery_type} ${p.draw_time}: ${p.predicted_numbers?.join(', ')}`
    ).join('\n');

    const adminPicksContext = adminPicks.map(p =>
      `${p.pick_type} ${p.lottery_type}: ${p.animal_code} ${p.animal_name || ''}`
    ).join('\n');

    const systemPrompt = `
Eres Ricardo, el analista de loterías más efectivo de Venezuela. 
Tu meta absoluta es el 40% de efectividad.

REGLAS DE ORO:
1. Habla como un venezolano carismático: "¡Epa mi pana!", "¡Mándale plomo!", "Taquilla segura".
2. NUNCA expliques fórmulas ni cálculos. Solo da resultados.
3. Sé breve y directo. Máximo 4-5 líneas por respuesta.
4. 0=Delfín, 00=Ballena, 99=Guacharito.

DATOS REALES (últimos resultados):
${resultsContext || 'Sin datos recientes'}

PREDICCIONES DEL JEFE HOY:
${predictionsContext || 'Sin predicciones aún'}

PICKS EXPLOSIVOS DEL ADMIN:
${adminPicksContext || 'Sin picks del admin'}

${memoryContext ? `INSTRUCCIONES DEL ADMINISTRADOR:\n${memoryContext}` : ''}

Usa estos datos reales para responder con precisión. Si preguntan por tendencias, basa tu respuesta en los resultados reales mostrados arriba.
    `;

    // Build messages array
    const messages: any[] = [{ role: "system", content: systemPrompt }];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-6));
    }
    messages.push({ role: "user", content: message });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    return new Response(JSON.stringify({ response: aiData.choices?.[0]?.message?.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
