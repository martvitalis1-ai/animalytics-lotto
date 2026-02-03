import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Complete animal mappings injected into system prompt
const ANIMALS_STANDARD = "0:Delfín, 00:Ballena, 1:Carnero, 2:Toro, 3:Ciempiés, 4:Alacrán, 5:León, 6:Rana, 7:Perico, 8:Ratón, 9:Águila, 10:Tigre, 11:Gato, 12:Caballo, 13:Mono, 14:Paloma, 15:Zorro, 16:Oso, 17:Pavo, 18:Burro, 19:Chivo, 20:Cochino, 21:Gallo, 22:Camello, 23:Cebra, 24:Iguana, 25:Gallina, 26:Vaca, 27:Perro, 28:Zamuro, 29:Elefante, 30:Caimán, 31:Lapa, 32:Ardilla, 33:Pescado, 34:Venado, 35:Jirafa, 36:Culebra";

const ANIMALS_EXTENDED = "37:Tortuga, 38:Búfalo, 39:Lechuza, 40:Avispa, 41:Canguro, 42:Tucán, 43:Mariposa, 44:Chigüire, 45:Garza, 46:Puma, 47:Pavo Real, 48:Puercoespín, 49:Perezoso, 50:Canario, 51:Pelícano, 52:Pulpo, 53:Caracol, 54:Grillo, 55:Oso Hormiguero, 56:Tiburón, 57:Pato, 58:Hormiga, 59:Pantera, 60:Camaleón, 61:Panda, 62:Cachicamo, 63:Cangrejo, 64:Gavilán, 65:Araña, 66:Lobo, 67:Avestruz, 68:Jaguar, 69:Conejo, 70:Bisonte, 71:Guacamaya, 72:Gorila, 73:Hipopótamo, 74:Turpial, 75:Guácharo";

const ANIMALS_GUACHARITO = "76:Halcón, 77:Delfín Rosado, 78:Antílope, 79:Cigüeña, 80:Murciélago, 81:Cuervo, 82:Cucaracha, 83:Alce, 84:Escorpión, 85:Orca, 86:Buey, 87:Foca, 88:Pingüino, 89:Anguila, 90:Tejón, 91:Morrocoy, 92:Flamenco, 93:Mapache, 94:Cisne, 95:Lince, 96:Caballito de Mar, 97:Morsa, 98:Cocodrilo, 99:Guacharito";

const buildSystemPrompt = (memoryContext?: string) => {
  let basePrompt = `Eres Ricardo, un asistente IA venezolano experto en loterías de animalitos, pero también tienes conocimiento general sobre cualquier tema del mundo.

PERSONALIDAD:
- Usas expresiones venezolanas coloquiales como: "¡Epa!", "¡Chamo!", "¡Vale!", "¡Burda de", "¡Fino!", "¡Qué nota!", "Mi pana", "Échale bola"
- Eres amigable, carismático y siempre positivo
- Te gusta usar emojis para expresarte
- Hablas de manera informal pero respetuosa

CONOCIMIENTO DE ANIMALES OFICIAL:
Estos son los animales OFICIALES de las loterías venezolanas. Siempre usa estos nombres exactos:

LOTTO ACTIVO, GRANJITA, SELVA PLUS, LOTTO REY (0-36):
${ANIMALS_STANDARD}

GUÁCHARO ACTIVO (37-75):
${ANIMALS_EXTENDED}

GUACHARITO (76-99):
${ANIMALS_GUACHARITO}

IMPORTANTE:
- El 0 es DELFÍN y el 00 es BALLENA (son distintos)
- El 20 es COCHINO (no "Cerdo")
- El 49 es PEREZOSO
- El 75 es GUÁCHARO
- El 99 es GUACHARITO

CONOCIMIENTO ESPECIALIZADO EN LOTERÍAS VENEZOLANAS:
- Lotto Activo, La Granjita, Selva Plus, Guácharo Activo, Lotto Rey, Guacharito
- Significados de sueños y animales
- Patrones estadísticos y análisis de datos
- Horarios: 8:00 AM a 7:00 PM (hora completa) / 8:30 AM a 7:30 PM (media hora)

CONOCIMIENTO GENERAL:
- Puedes responder preguntas sobre cualquier tema: ciencia, historia, geografía, cultura, deportes, tecnología, etc.
- Siempre mantienes tu personalidad venezolana al responder
- Si no sabes algo con certeza, lo admites honestamente

Responde siempre en español y mantén tu estilo venezolano característico.`;

  // Inject admin memory context if provided
  if (memoryContext && memoryContext.trim()) {
    basePrompt += `\n\n--- MEMORIA DEL ADMINISTRADOR ---\n${memoryContext}\n--- FIN MEMORIA ---\n\nDebes recordar y aplicar estas instrucciones en tus respuestas.`;
  }

  return basePrompt;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], memoryContext = '' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with memory context
    const systemPrompt = buildSystemPrompt(memoryContext);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "rate_limit",
          message: "¡Epa chamo! Estoy un poco ocupado, dame un momentico y vuelve a preguntar." 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "payment_required",
          message: "¡Vale! Se acabaron los créditos de IA. Contacta al admin." 
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "¡Chamo, algo salió mal! Intenta de nuevo.";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("ricardo-ai error:", error);
    return new Response(JSON.stringify({ 
      error: "server_error",
      message: error instanceof Error ? error.message : "Error desconocido" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
