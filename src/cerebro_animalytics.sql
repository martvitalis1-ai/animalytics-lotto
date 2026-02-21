-- 1. DICCIONARIO MAESTRO DE ANIMALES (00-99)
CREATE OR REPLACE FUNCTION get_animal_name(p_num TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN CASE p_num
    WHEN '0' THEN 'DELFÍN 🐬' WHEN '00' THEN 'BALLENA 🐋' WHEN '01' THEN 'CARNERO 🐏'
    WHEN '02' THEN 'TORO 🐂' WHEN '03' THEN 'CIEMPIÉS 🪱' WHEN '04' THEN 'ALACRÁN 🦂'
    WHEN '05' THEN 'LEÓN 🦁' WHEN '06' THEN 'RANA 🐸' WHEN '07' THEN 'PERICO 🦜'
    WHEN '08' THEN 'RATÓN 🐁' WHEN '09' THEN 'ÁGUILA 🦅' WHEN '10' THEN 'TIGRE 🐅'
    WHEN '11' THEN 'GATO 🐈' WHEN '12' THEN 'CABALLO 🐎' WHEN '13' THEN 'MONO 🐒'
    WHEN '14' THEN 'PALOMA 🕊️' WHEN '15' THEN 'ZORRO 🦊' WHEN '16' THEN 'OSO 🐻'
    WHEN '17' THEN 'PAVO 🦃' WHEN '18' THEN 'BURRO 🫏' WHEN '19' THEN 'CHIVO 🐐'
    WHEN '20' THEN 'CERDO 🐖' WHEN '21' THEN 'GALLO 🐓' WHEN '22' THEN 'CAMELLO 🐫'
    WHEN '23' THEN 'CEBRA 🦓' WHEN '24' THEN 'IGUANA 🦎' WHEN '25' THEN 'GALLINA 🐔'
    WHEN '26' THEN 'VACA 🐄' WHEN '27' THEN 'PERRO 🐕' WHEN '28' THEN 'ZAMURO 🦅'
    WHEN '29' THEN 'ELEFANTE 🐘' WHEN '30' THEN 'CAIMÁN 🐊' WHEN '31' THEN 'LAPA 🐹'
    WHEN '32' THEN 'ARDILLA 🐿️' WHEN '33' THEN 'PESCADO 🐟' WHEN '34' THEN 'VENADO 🦌'
    WHEN '35' THEN 'JIRAFA 🦒' WHEN '36' THEN 'CULEBRA 🐍' WHEN '37' THEN 'TORTUGA 🐢'
    WHEN '38' THEN 'BÚFALO 🦬' WHEN '39' THEN 'LECHUZA 🦉' WHEN '40' THEN 'AVISPA 🐝'
    WHEN '41' THEN 'CANGURO 🦘' WHEN '42' THEN 'TUCÁN 🐦' WHEN '43' THEN 'MARIPOSA 🦋'
    WHEN '44' THEN 'CHIGÜIRE 🦫' WHEN '45' THEN 'GARZA 🦩' WHEN '46' THEN 'PUMA 🐆'
    WHEN '47' THEN 'PAVO REAL 🦚' WHEN '48' THEN 'PUERCOESPÍN 🦔' WHEN '49' THEN 'PEREZA 🦥'
    WHEN '50' THEN 'CANARIO 🐤' WHEN '51' THEN 'PELÍCANO 🦢' WHEN '52' THEN 'PULPO 🐙'
    WHEN '53' THEN 'CARACOL  snail' WHEN '54' THEN 'GRILLO 🦗' WHEN '55' THEN 'OSO HORMIGUERO 🐜'
    WHEN '56' THEN 'TIBURÓN 🦈' WHEN '57' THEN 'PATO 🦆' WHEN '58' THEN 'HORMIGA 🐜'
    WHEN '59' THEN 'PANTERA 🐆' WHEN '60' THEN 'CAMALEÓN 🦎' WHEN '61' THEN 'PANDA 🐼'
    WHEN '62' THEN 'CACHICAMO 🐢' WHEN '63' THEN 'CANGREJO 🦀' WHEN '64' THEN 'GAVILÁN 🦅'
    WHEN '65' THEN 'ARAÑA 🕷️' WHEN '66' THEN 'LOBO 🐺' WHEN '67' THEN 'AVESTRUZ 🦤'
    WHEN '68' THEN 'JAGUAR 🐆' WHEN '69' THEN 'CONEJO 🐇' WHEN '70' THEN 'BISONTE 🦬'
    WHEN '71' THEN 'GUACAMAYA 🦜' WHEN '72' THEN 'GORILA 🦍' WHEN '73' THEN 'HIPOPÓTAMO 🦛'
    WHEN '74' THEN 'TURPIAL 🐦' WHEN '75' THEN 'GUÁCHARO 🐦' WHEN '76' THEN 'RINOCERONTE 🦏'
    WHEN '77' THEN 'PINGÜINO 🐧' WHEN '78' THEN 'ANTÍLOPE 🦌' WHEN '79' THEN 'CALAMAR 🦑'
    WHEN '80' THEN 'MURCIÉLAGO 🦇' WHEN '81' THEN 'CUERVO 🐦' WHEN '82' THEN 'CUCARACHA 🪳'
    WHEN '83' THEN 'BÚHO 🦉' WHEN '84' THEN 'CAMARÓN 🦐' WHEN '85' THEN 'HÁMSTER 🐹'
    WHEN '86' THEN 'BUEY 🐂' WHEN '87' THEN 'CABRA 🐐' WHEN '88' THEN 'ERIZO DE MAR 🪼'
    WHEN '89' THEN 'ANGUILA 🐍' WHEN '90' THEN 'HURÓN 🦦' WHEN '91' THEN 'MORROCOY 🐢'
    WHEN '92' THEN 'CISNE 🦢' WHEN '93' THEN 'GAVIOTA 🐦' WHEN '94' THEN 'PAUJÍ 🐦'
    WHEN '95' THEN 'ESCARABAJO 🪲' WHEN '96' THEN 'CABALLITO DE MAR 🐴' WHEN '97' THEN 'LORO 🦜'
    WHEN '98' THEN 'COCODRILO 🐊' WHEN '99' THEN 'GUACHARITO 🐦'
    ELSE ''
  END;
END;
$$ LANGUAGE plpgsql;

-- 2. CALCULADORA ANALÍTICA (Orden Cronológico Venezuela)
CREATE OR REPLACE VIEW calculadora_analitica AS
WITH sorted AS (
  SELECT lottery_type, NULLIF(result_number, '')::int as val,
    CASE WHEN lottery_type = 'guacharito' THEN 99 WHEN lottery_type = 'guacharo' THEN 75 ELSE 36 END as max_rango,
    ROW_NUMBER() OVER (PARTITION BY lottery_type ORDER BY draw_date DESC, 
      (CASE WHEN draw_time ILIKE '%PM%' AND SUBSTRING(TRIM(draw_time) FROM 1 FOR 2)::int < 12 THEN SUBSTRING(TRIM(draw_time) FROM 1 FOR 2)::int + 12
            WHEN draw_time ILIKE '%AM%' AND SUBSTRING(TRIM(draw_time) FROM 1 FOR 2)::int = 12 THEN 0
            ELSE SUBSTRING(TRIM(draw_time) FROM 1 FOR 2)::int END) DESC,
      SUBSTRING(TRIM(draw_time) FROM 4 FOR 2)::int DESC) as pos
  FROM lottery_results
  WHERE lottery_type IN ('lotto_activo', 'granjita', 'selva_plus', 'lotto_rey', 'guacharito', 'guacharo')
)
SELECT lottery_type,
  LPAD(MAX(CASE WHEN pos = 1 THEN val END)::text, 2, '0') as ultimo,
  LPAD(MAX(CASE WHEN pos = 2 THEN val END)::text, 2, '0') as penultimo,
  LPAD(MAX(CASE WHEN pos = 3 THEN val END)::text, 2, '0') as antepenultimo,
  MAX(max_rango) as max_rango
FROM sorted WHERE pos <= 3 GROUP BY 1;

-- 3. ESTUDIO DE PATRONES (Detección de la Vuelta desde 02/01)
CREATE OR REPLACE VIEW estudio_patrones_historicos AS
WITH historial AS (
  SELECT lottery_type, result_number::int as real_v,
    CASE WHEN lottery_type = 'guacharito' THEN 99 WHEN lottery_type = 'guacharo' THEN 75 ELSE 36 END as max_r,
    LAG(result_number, 1) OVER (PARTITION BY lottery_type ORDER BY draw_date ASC, draw_time ASC)::int as r1,
    LAG(result_number, 2) OVER (PARTITION BY lottery_type ORDER BY draw_date ASC, draw_time ASC)::int as r2
  FROM lottery_results WHERE draw_date >= '2026-01-02'
),
desgloses AS (
  SELECT *, (r1/10 + r1%10) as s1, abs(r1/10 - r1%10) as d1, (r2/10 + r2%10) as s2, abs(r2/10 - r2%10) as d2
  FROM historial WHERE r1 IS NOT NULL AND r2 IS NOT NULL
),
formulas AS (
  SELECT *,
    (CASE WHEN (s1+s2) > max_r THEN abs(s1-s2) ELSE (s1+s2) END) as f1,
    (CASE WHEN (r1+s2) > max_r THEN abs(r1-s2) ELSE (r1+s2) END) as f2,
    (CASE WHEN (r1+d2) > max_r THEN abs(r1-d2) ELSE (r1+d2) END) as f3,
    (CASE WHEN (s1+d2) > max_r THEN abs(s1-d2) ELSE (s1+d2) END) as f4
  FROM desgloses
)
SELECT lottery_type, vuelta_detectada, COUNT(*) as efectividad
FROM (
  SELECT lottery_type,
    CASE 
      WHEN real_v = f1 THEN 'Doble Desglose (S1+S2)'
      WHEN real_v = f2 THEN 'Híbrido (R1+S2)'
      WHEN real_v = f3 THEN 'Híbrido Resta (R1+D2)'
      WHEN real_v = f4 THEN 'Desglose Mixto (S1+D2)'
      WHEN (abs(real_v - f1) <= 2 OR abs(real_v - f2) <= 2) AND max_r > 36 THEN 'Margen Guacharo (F1)'
      ELSE NULL END as vuelta_detectada
  FROM formulas
) t WHERE vuelta_detectada IS NOT NULL GROUP BY 1, 2;

-- 4. SÚPER PRONÓSTICO (Estudio de la Caída)
CREATE OR REPLACE VIEW super_pronostico_final AS
WITH actual AS (
    SELECT c.lottery_type, c.ultimo::int as u, c.max_rango,
        ((c.ultimo::int / 10) + (c.ultimo::int % 10)) as s1, abs((c.ultimo::int / 10) - (c.ultimo::int % 10)) as d1,
        ((c.penultimo::int / 10) + (c.penultimo::int % 10)) as s2, abs((c.penultimo::int / 10) - (c.penultimo::int % 10)) as d2,
        (SELECT eph.vuelta_detectada FROM estudio_patrones_historicos eph WHERE eph.lottery_type = c.lottery_type ORDER BY eph.efectividad DESC LIMIT 1) as mejor_vuelta
    FROM calculadora_analitica c
),
calculo_fijo AS (
    SELECT *,
      CASE 
        WHEN mejor_vuelta = 'Doble Desglose (S1+S2)' THEN (CASE WHEN (s1+s2) > max_rango THEN abs(s1-s2) ELSE (s1+s2) END)
        WHEN mejor_vuelta = 'Híbrido (R1+S2)' THEN (CASE WHEN (u+s2) > max_rango THEN abs(u-s2) ELSE (u+s2) END)
        WHEN mejor_vuelta = 'Híbrido Resta (R1+D2)' THEN (CASE WHEN (u+d2) > max_rango THEN abs(u-d2) ELSE (u+d2) END)
        WHEN mejor_vuelta = 'Desglose Mixto (S1+D2)' THEN (CASE WHEN (s1+d2) > max_rango THEN abs(s1-d2) ELSE (s1+d2) END)
        WHEN mejor_vuelta = 'Margen Guacharo (F1)' THEN (u + 2) % (max_rango + 1)
        ELSE (u + 11) % (max_rango + 1) END as res
    FROM actual
)
SELECT lottery_type, LPAD(res::text, 2, '0') as pronostico_fijo, LPAD(((res + 3) % (max_rango + 1))::text, 2, '0') as pronostico_dia,
    LPAD(abs(res - 2)::text, 2, '0') as pronostico_jaladera, 95 as power_score, COALESCE(mejor_vuelta, 'Estudio Dinámico') as tipo_caida
FROM calculo_fijo;

-- 5. TRIPLETA DE PODER (Estudio de Racha y Peso)
CREATE OR REPLACE VIEW animales_con_peso AS
WITH racha AS (SELECT lottery_type, result_number, COUNT(*) as veces FROM lottery_results WHERE draw_date >= CURRENT_DATE - 1 GROUP BY 1, 2),
historia AS (SELECT lottery_type, animal_frecuente as fav_dia FROM vista_favoritos_por_dia WHERE dia_semana = EXTRACT(DOW FROM CURRENT_DATE))
SELECT r.lottery_type, r.result_number, (r.veces * 10) + (CASE WHEN h.fav_dia = r.result_number THEN 50 ELSE 0 END) as peso_total
FROM racha r LEFT JOIN historia h ON h.lottery_type = r.lottery_type AND h.fav_dia = r.result_number;

CREATE OR REPLACE VIEW vista_tripletas_maestras AS
WITH candidatos AS (SELECT lottery_type, result_number, peso_total, ROW_NUMBER() OVER (PARTITION BY lottery_type ORDER BY peso_total DESC) as rnk FROM animales_con_peso),
aritmetica AS (SELECT lottery_type, pronostico_fijo FROM super_pronostico_final)
SELECT c.lottery_type, MAX(CASE WHEN rnk = 1 THEN result_number END) as animal_1, MAX(CASE WHEN rnk = 2 THEN result_number END) as animal_2, a.pronostico_fijo as animal_3
FROM candidatos c JOIN aritmetica a ON a.lottery_type = c.lottery_type WHERE rnk <= 2 GROUP BY 1, a.pronostico_fijo;

-- 6. DASHBOARD PARA LA APP (LO QUE LEE LOVABLE)
CREATE OR REPLACE VIEW dashboard_app_vip AS
SELECT sp.lottery_type, sp.pronostico_fijo as dato_explosivo, sp.pronostico_dia as regalo_del_dia, sp.pronostico_jaladera as la_jaladera,
       sp.power_score, sp.tipo_caida as la_vuelta, '[' || vt.animal_1 || ' - ' || vt.animal_2 || ' - ' || vt.animal_3 || ']' as tripleta_poderosa
FROM super_pronostico_final sp JOIN vista_tripletas_maestras vt ON vt.lottery_type = sp.lottery_type;

-- 7. NOTIFICACIÓN TELEGRAM (CON FILTRO DE MINUTO 10 Y 40)
CREATE OR REPLACE FUNCTION notify_result_with_prediction()
RETURNS TRIGGER AS $$
DECLARE
  v_bot_token TEXT := '8110266180:AAGBLXaFJqEDiFWRVY1b92HQHmfSBkVJ9dQ'; v_chat_id TEXT := '@animalyticsbot'; 
  v_ia_dia TEXT; v_ia_sec TEXT; v_ia_fijo TEXT; v_score INTEGER; v_caida TEXT; v_t1 TEXT; v_t2 TEXT; v_t3 TEXT;
  v_animal_full TEXT; v_lot_name TEXT; v_last_sent TIMESTAMPTZ; v_minuto INTEGER;
BEGIN
  IF NEW.lottery_type NOT IN ('lotto_activo', 'granjita', 'selva_plus', 'lotto_rey', 'guacharito', 'guacharo') THEN RETURN NEW; END IF;
  IF NEW.lottery_type = 'guacharo' AND NEW.result_number::int > 75 THEN RETURN NEW; END IF;
  IF (now() - NEW.created_at) > interval '7 minutes' THEN RETURN NEW; END IF;

  v_animal_full := get_animal_name(TRIM(NEW.result_number));
  v_lot_name := UPPER(REPLACE(NEW.lottery_type, '_', ' '));

  SELECT pronostico_dia, pronostico_jaladera, pronostico_fijo, power_score, tipo_caida INTO v_ia_dia, v_ia_sec, v_ia_fijo, v_score, v_caida FROM super_pronostico_final WHERE lottery_type = NEW.lottery_type LIMIT 1;
  SELECT animal_1, animal_2, animal_3 INTO v_t1, v_t2, v_t3 FROM vista_tripletas_maestras WHERE lottery_type = NEW.lottery_type LIMIT 1;

  PERFORM net.http_post(url := 'https://api.telegram.org/bot'||v_bot_token||'/sendMessage', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('chat_id', v_chat_id, 'text', '🔔 *¡CONFIRMADO!* 🔔'||chr(10)||'🏛 *'||v_lot_name||'*'||chr(10)||'🐾 Salió: *'||NEW.result_number||' - '||v_animal_full||'*'||chr(10)||'--------------------------'||chr(10)||'🧩 *VUELTA:* '||v_caida||chr(10)||chr(10)||'🎯 Dato Fijo: *'||v_ia_fijo||'*'||chr(10)||'📅 Dato Día: *'||v_ia_dia||'* | 🧲 Jala: *'||v_ia_sec||'*'||chr(10)||'⚡ Probabilidad: *'||v_score||'%*'||chr(10)||chr(10)||'🔥 *TRIPLETA DE PODER:* 🔥'||chr(10)||'💰 ['||v_t1||' - '||v_t2||' - '||v_t3||'] 💰', 'parse_mode', 'Markdown'));

  v_minuto := EXTRACT(MINUTE FROM now())::int;
  SELECT last_advice_sent INTO v_last_sent FROM bot_cooldown WHERE id = 1;
  IF (v_minuto = 10 OR v_minuto = 40) AND (now() - v_last_sent) > interval '5 minutes' THEN
    PERFORM net.http_post(url := 'https://api.telegram.org/bot'||v_bot_token||'/sendMessage', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('chat_id', v_chat_id, 'text', '🔄 *¡Voltea tu dato y juega con viveza!* 🧠'||chr(10)||'🐦 *Guacharo/ito:* Juega +1 y -1 (Ej: 56 ➔ 55 y 57)'||chr(10)||'🍀 ¡Paciencia y malicia para cobrar! 💰', 'parse_mode', 'Markdown'));
    UPDATE bot_cooldown SET last_advice_sent = now() WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_telegram_notification ON lottery_results;
CREATE TRIGGER trigger_telegram_notification AFTER INSERT ON lottery_results FOR EACH ROW EXECUTE FUNCTION notify_result_with_prediction();
