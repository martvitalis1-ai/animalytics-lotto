// Base de conocimiento de Ricardo sobre loterías de animalitos venezolanos
export const RICARDO_KNOWLEDGE = {
  // Información sobre cada lotería
  lotteries: {
    lotto_activo: {
      name: "Lotto Activo",
      description: "La lotería más popular de Venezuela. Sorteos cada 30 minutos desde las 8:00 AM hasta las 7:00 PM.",
      tips: "Los animales más 'calientes' suelen repetir en horarios similares. El Tigre (10) y el Caballo (12) son favoritos del público.",
      schedule: "Cada 30 minutos de 8:00 AM a 7:00 PM",
      type: "animalitos"
    },
    granjita: {
      name: "La Granjita",
      description: "Lotería tradicional con 37 animales. Muy seguida en el interior del país.",
      tips: "La Granjita tiene patrones únicos. El Gallo (21) y la Vaca (26) son números que salen mucho en las mañanas.",
      schedule: "Similar a Lotto Activo",
      type: "animalitos"
    },
    selva_plus: {
      name: "Selva Plus",
      description: "Lotería selvática con animales del bosque. Premios atractivos.",
      tips: "Aquí el León (5) y el Tigre (10) mandan. Números fuertes de la selva.",
      schedule: "Sorteos cada hora",
      type: "animalitos"
    },
    lotto_rey: {
      name: "Lotto Rey",
      description: "El rey de las loterías. Pagos generosos y mucha acción.",
      tips: "Lotería con buena racha para animales de granja. El Cochino (20) ha dado muchas alegrías.",
      schedule: "Sorteos frecuentes",
      type: "animalitos"
    },
    guacharo: {
      name: "Guácharo Activo",
      description: "Lotería numérica del 00 al 75. El Guácharo (75) es el premio especial.",
      tips: "Aquí no hay animalitos, pero el 00 (Ballena) y 75 (Guácharo) son los favoritos.",
      schedule: "Sorteos cada 30 minutos",
      type: "numeros"
    },
    guacharito: {
      name: "Guacharito",
      description: "Versión extendida con números del 00 al 99. Más opciones, más emoción.",
      tips: "Los números terminados en 7 tienen buena racha histórica.",
      schedule: "Sorteos cada hora",
      type: "numeros"
    }
  },

  // Mapeo de animales con significados y sueños
  animalMeanings: {
    '0': { animal: 'DELFÍN', meaning: 'Inteligencia, amistad', dreams: 'Soñar con mar, piscina, agua cristalina' },
    '00': { animal: 'BALLENA', meaning: 'Grandeza, abundancia', dreams: 'Soñar con océano, ballenas, viajes en barco' },
    '1': { animal: 'CARNERO', meaning: 'Liderazgo, fuerza', dreams: 'Soñar con montañas, cabras, cuernos' },
    '2': { animal: 'TORO', meaning: 'Fortaleza, determinación', dreams: 'Soñar con corridas, fincas, toros bravos' },
    '3': { animal: 'CIEMPIÉS', meaning: 'Muchas oportunidades', dreams: 'Soñar con insectos, caminos largos' },
    '4': { animal: 'ALACRÁN', meaning: 'Protección, defensa', dreams: 'Soñar con desierto, peligros superados' },
    '5': { animal: 'LEÓN', meaning: 'Poder, autoridad', dreams: 'Soñar con reyes, coronas, selva' },
    '6': { animal: 'RANA', meaning: 'Transformación', dreams: 'Soñar con lluvia, charcos, príncipes' },
    '7': { animal: 'PERICO', meaning: 'Comunicación', dreams: 'Soñar con pájaros hablando, colores verdes' },
    '8': { animal: 'RATÓN', meaning: 'Astucia, recursos', dreams: 'Soñar con queso, escondites, pequeñeces' },
    '9': { animal: 'ÁGUILA', meaning: 'Visión clara', dreams: 'Soñar con volar alto, montañas, cielo' },
    '10': { animal: 'TIGRE', meaning: 'Valentía, pasión', dreams: 'Soñar con felinos, rayas, jungla' },
    '11': { animal: 'GATO', meaning: 'Independencia', dreams: 'Soñar con gatos, noches, misterio' },
    '12': { animal: 'CABALLO', meaning: 'Libertad, velocidad', dreams: 'Soñar con carreras, cabalgar, fincas' },
    '13': { animal: 'MONO', meaning: 'Diversión, inteligencia', dreams: 'Soñar con bromas, selva, bananas' },
    '14': { animal: 'PALOMA', meaning: 'Paz, amor', dreams: 'Soñar con bodas, mensajes, cielo' },
    '15': { animal: 'ZORRO', meaning: 'Astucia', dreams: 'Soñar con engaños superados, bosque' },
    '16': { animal: 'OSO', meaning: 'Fuerza protectora', dreams: 'Soñar con abrazo fuerte, montaña, miel' },
    '17': { animal: 'PAVO', meaning: 'Orgullo', dreams: 'Soñar con fiestas, Navidad, plumas' },
    '18': { animal: 'BURRO', meaning: 'Trabajo duro', dreams: 'Soñar con cargas, caminos, campo' },
    '19': { animal: 'CHIVO', meaning: 'Caprichos', dreams: 'Soñar con montañas, saltos, barba' },
    '20': { animal: 'COCHINO', meaning: 'Abundancia, dinero', dreams: 'Soñar con comida, fango, riqueza' },
    '21': { animal: 'GALLO', meaning: 'Madrugador, victoria', dreams: 'Soñar con amanecer, pelea ganada' },
    '22': { animal: 'CAMELLO', meaning: 'Resistencia', dreams: 'Soñar con desierto, viajes largos' },
    '23': { animal: 'CEBRA', meaning: 'Equilibrio', dreams: 'Soñar con rayas, África, blanco y negro' },
    '24': { animal: 'IGUANA', meaning: 'Paciencia', dreams: 'Soñar con reptiles, sol, calor' },
    '25': { animal: 'GALLINA', meaning: 'Maternidad', dreams: 'Soñar con huevos, pollitos, nido' },
    '26': { animal: 'VACA', meaning: 'Nutrición, dinero', dreams: 'Soñar con leche, campo verde, finca' },
    '27': { animal: 'PERRO', meaning: 'Lealtad', dreams: 'Soñar con amigo fiel, casa, protección' },
    '28': { animal: 'ZAMURO', meaning: 'Limpieza, renovación', dreams: 'Soñar con vuelo circular, cielo' },
    '29': { animal: 'ELEFANTE', meaning: 'Memoria, sabiduría', dreams: 'Soñar con circo, manada, trompeta' },
    '30': { animal: 'CAIMÁN', meaning: 'Peligro superado', dreams: 'Soñar con río, pantano, escamas' },
    '31': { animal: 'LAPA', meaning: 'Hogar', dreams: 'Soñar con cueva, escondite, monte' },
    '32': { animal: 'ARDILLA', meaning: 'Ahorro', dreams: 'Soñar con nueces, árboles, rapidez' },
    '33': { animal: 'PESCADO', meaning: 'Prosperidad', dreams: 'Soñar con pesca, mar, río abundante' },
    '34': { animal: 'VENADO', meaning: 'Gracia, velocidad', dreams: 'Soñar con bosque, cuernos, saltos' },
    '35': { animal: 'JIRAFA', meaning: 'Visión elevada', dreams: 'Soñar con altura, ver lejos, África' },
    '36': { animal: 'CULEBRA', meaning: 'Transformación total', dreams: 'Soñar con serpientes, mudanza de piel' }
  },

  // Frases venezolanas de Ricardo
  expressions: [
    "¡Epa mi pana!",
    "¡Qué nota!",
    "¡Está que pela!",
    "¡Chévere!",
    "¡Vale!",
    "¡Mira chamo!",
    "¡Eso está buenísimo!",
    "¡Pa' lante!",
    "¡Épale!",
    "¡Qué fino!",
    "¡Arrecho!",
    "¡De pinga!",
    "¡Burda de bueno!",
    "¡Está molleja!",
    "¡Tranquilo mi hermano!"
  ],

  // Respuestas para diferentes contextos
  responses: {
    greeting: [
      "¡Épale mi pana! Soy Ricardo, tu experto en animalitos. ¿En qué te ayudo hoy?",
      "¡Qué más chamo! Ricardo a la orden para darte los mejores datos de animalitos.",
      "¡Epa! Aquí Ricardo listo pa' darte la información que necesitas. ¿Qué lotería te interesa?",
      "¡Vale! Bienvenido a Animalytics. Soy Ricardo y tengo la data fresquita pa' ti."
    ],
    prediction: [
      "Mira chamo, según mi análisis los números calientes pa' hoy son: ",
      "Épale, la IA me dice que estos animalitos vienen con fuerza: ",
      "¡Vale! Basado en el historial, te recomiendo estos números: ",
      "Oye pana, la data está clara, estos son los que pegan hoy: "
    ],
    noData: [
      "Chamo, no tengo suficientes datos todavía. ¿Por qué no insertamos algunos resultados primero?",
      "Épale, necesito más información pa' darte un buen pronóstico. ¡Vamos a cargar resultados!",
      "Mi pana, la base está vacía. Primero hay que meter los resultados del día."
    ],
    encouragement: [
      "¡Tranquilo que el que persevera vence!",
      "¡Pa' lante que vamos bien!",
      "¡Hoy es el día, yo lo siento!",
      "¡La suerte está de tu lado hoy!"
    ],
    farewell: [
      "¡Chao pana! ¡Que te pegue!",
      "¡Éxito mi hermano! Aquí estoy cuando necesites.",
      "¡Cuídate vale! ¡A ganar se ha dicho!",
      "¡Nos vemos! Recuerda revisar los resultados luego."
    ]
  },

  // Estrategias de juego
  strategies: {
    hot: "Números 'calientes' - Han salido frecuentemente en los últimos días. La teoría dice que pueden seguir saliendo.",
    cold: "Números 'fríos' - No han salido en mucho tiempo. Algunos jugadores creen que 'ya les toca'.",
    overdue: "Números 'vencidos' - Estadísticamente deberían haber salido. Pueden ser buena apuesta.",
    pattern: "Análisis de patrones - Busco repeticiones por hora del día, día de la semana, o secuencias.",
    dreams: "Interpretación de sueños - Cada animal tiene un significado. ¡Cuéntame tu sueño!"
  },

  // Tips generales
  tips: [
    "Los resultados de la mañana (8-11 AM) tienden a repetir patrones semanales.",
    "El Tigre (10) es estadísticamente uno de los más frecuentes en Lotto Activo.",
    "Los viernes hay más actividad y los números suelen variar más.",
    "El Cochino (20) históricamente sale más los días de quincena.",
    "Las terminaciones en 5 y 0 tienen buena racha histórica.",
    "El Perro (27) es fiel - cuando sale, suele repetir en las próximas horas.",
    "La Culebra (36) es el último número, pero no el menos frecuente.",
    "Los números dobles (11, 22, 33) tienen patrones interesantes los lunes."
  ]
};

// Función para generar respuesta estilo Ricardo
export const getRandomExpression = () => {
  const expressions = RICARDO_KNOWLEDGE.expressions;
  return expressions[Math.floor(Math.random() * expressions.length)];
};

export const getRandomResponse = (type: keyof typeof RICARDO_KNOWLEDGE.responses) => {
  const responses = RICARDO_KNOWLEDGE.responses[type];
  return responses[Math.floor(Math.random() * responses.length)];
};

export const getAnimalMeaning = (number: string) => {
  return RICARDO_KNOWLEDGE.animalMeanings[number] || null;
};

export const getLotteryInfo = (lotteryId: string) => {
  return RICARDO_KNOWLEDGE.lotteries[lotteryId as keyof typeof RICARDO_KNOWLEDGE.lotteries] || null;
};

export const getRandomTip = () => {
  const tips = RICARDO_KNOWLEDGE.tips;
  return tips[Math.floor(Math.random() * tips.length)];
};
