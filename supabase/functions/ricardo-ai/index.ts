import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-client@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, lottery_type = 'granjita' } = await req.json();

    // 1. Conexión a la Base de Datos
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 2. OBTENER DATOS REALES PARA EL ANÁLISIS
    // A. Últimos 4 resultados para la suma cruzada
    const { data: last4 } = await supabase
      .from('lottery_results')
      .select('result_number, animal_name')
      .eq('lottery_type', lottery_type)
      .order('draw_date', { ascending: false })
      .order('draw_time', { ascending: false })
      .limit(4);

    // B. Consultar la Matriz de Secuencia
    const ultimoAnimal = last4?.[0]?.result_number;
    const { data: sugeridos } = await supabase
      .from('matriz_inteligente')
      .select('siguiente, frecuencia')
      .eq('lottery_type', lottery_type)
      .eq('actual', ultimoAnimal)
      .limit(3);

    // 3. CÁLCULO DE VIBRACIÓN (Suma Cruzada 1ero + 4to)
    let vibracion = "No disponible";
    if (last4 && last4.length === 4) {
      const suma = (parseInt(last4[0].result_number) + parseInt(last4[3].result_number)) % 100;
      vibracion = suma.toString().padStart(2, '0');
    }

    // 4. CONSTRUIR EL PROMPT CON DATOS REALES
    const context = `
      CONTEXTO REAL DE LA LOTERÍA ${lottery_type.toUpperCase()}:
      - Últimos resultados: ${last4?.map(r => r.result_number + ' (' + r.animal_name + ')').join(', ')}
      - Según la historia desde enero, después del ${ultimoAnimal} suelen salir: ${sugeridos?.map(s => s.siguiente).join(', ')}
      - El número vibracional por suma cruzada hoy es: ${vibracion}
    `;

    const systemPrompt = `Eres Ricardo, experto en animalitos. 
    Usa el siguiente contexto para dar tus pronósticos. No adivines, usa los números que te doy.
    ${context}
    Habla como venezolano: "¡Epa chamo!", "¡Fino!", "Échale bola". 
    Si te piden un dato, explica que te basas en la Matriz de Secuencia y la Suma Cruzada.`;

    // 5. LLAMADA A LA IA
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
