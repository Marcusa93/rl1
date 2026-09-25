"use client";

// Guía descargable del Laboratorio de IA · BBVA (clase inicial).
// Estilo editorial "papel": portada, tarjeta personal, las dos partes de la clase,
// hoja de trabajo, lo que eligió el grupo y el cierre con el recorrido.
// Solo fuentes built-in (Helvetica / Courier): nada de emojis ni símbolos fuera de WinAnsi.

import { Document, Page, Text, View, StyleSheet, Image, Font, pdf, type Styles } from "@react-pdf/renderer";
import {
  armarTarjeta,
  BBVA_FORMULA,
  BBVA_RECORRIDO,
  BBVA_ACTIVIDADES,
  BBVA_TESIS,
  BBVA_FECHA,
  getArea,
  labelOpcion,
  type ResultadosBbva,
  type TarjetaCandidato,
} from "@/lib/bbva-clase";
import {
  GUIA_TITULO,
  GUIA_SUBTITULO,
  GUIA_CHUMBITA,
  GUIA_MARCO,
  GUIA_DESARMA,
  GUIA_PROXIMO,
  type ParteGuia,
} from "@/lib/bbva-guia";

export interface DatosGuia {
  nombre: string; // nombre y apellido (puede venir vacío → "Participante")
  area?: string; // AreaId ("riesgos"...) → se muestra getArea(area)?.label
  respuestas: Record<string, Record<string, string | string[]>>; // activity → item_key → v
  grupo?: ResultadosBbva | null; // opcional: resultados de bbva_a1 para "lo que eligió el grupo"
}

// --- Paleta y tipografía --------------------------------------------------------

const C = {
  papel: "#f2eee6",
  blanco: "#fbfaf7",
  tinta: "#17181b",
  grafito: "#45484f",
  gris: "#8a8d94",
  pizarra: "#5d7087",
  naranja: "#e2582b",
  linea: "#d6d0c4",
};

const F = {
  regular: "Helvetica",
  mono: "Courier",
};

const MX = 58; // margen horizontal

const s = StyleSheet.create({
  page: {
    backgroundColor: C.blanco,
    paddingTop: 58,
    paddingBottom: 78,
    paddingHorizontal: MX,
    fontFamily: F.regular,
    fontSize: 10.5,
    color: C.tinta,
    lineHeight: 1.5,
  },
  pagePapel: { backgroundColor: C.papel },

  // Pie
  footer: {
    position: "absolute",
    bottom: 32,
    left: MX,
    right: MX,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.6,
    borderTopColor: C.linea,
    paddingTop: 7,
  },
  footerText: { fontFamily: F.mono, fontSize: 7.5, color: C.gris, letterSpacing: 0.3 },

  // Tipos comunes
  kicker: { fontFamily: F.mono, fontSize: 8, color: C.pizarra, letterSpacing: 1.2, textTransform: "uppercase" },
  kickerNaranja: { color: C.naranja },
  h1: { fontFamily: F.regular, fontWeight: 700, fontSize: 24, lineHeight: 1.18, color: C.tinta, marginTop: 8 },
  pregunta: { fontFamily: F.regular, fontStyle: "italic", fontSize: 13, lineHeight: 1.4, color: C.grafito, marginTop: 6 },
  regla: { height: 2, width: 44, backgroundColor: C.naranja, marginTop: 16, marginBottom: 22 },
  h3: { fontFamily: F.regular, fontWeight: 700, fontSize: 12.5, lineHeight: 1.3, color: C.tinta, marginBottom: 4 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: C.grafito },
  small: { fontSize: 9, lineHeight: 1.45, color: C.gris },

  // Ideas
  idea: { flexDirection: "row", marginBottom: 18 },
  ideaNum: { width: 30, fontFamily: F.mono, fontSize: 9, color: C.naranja, paddingTop: 2.5 },
  ideaBody: { flex: 1 },
  puntos: { marginTop: 6 },
  punto: { flexDirection: "row", marginBottom: 4 },
  vineta: { width: 5, height: 5, backgroundColor: C.naranja, marginTop: 5.5, marginRight: 9 },
  puntoTxt: { flex: 1, fontSize: 10, lineHeight: 1.5, color: C.grafito },

  // Ficha / tarjeta
  ficha: { borderWidth: 1.2, borderColor: C.tinta, backgroundColor: C.papel, padding: 20 },
  fichaTitulo: { fontFamily: F.regular, fontWeight: 700, fontSize: 18, color: C.tinta, marginTop: 4, marginBottom: 12 },
  fichaFila: { marginBottom: 10 },
  fichaEtq: { fontFamily: F.mono, fontSize: 7.5, color: C.pizarra, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 },
  fichaTxt: { fontSize: 11, lineHeight: 1.5, color: C.tinta },
  resaltado: { fontFamily: F.regular, fontWeight: 700, color: C.naranja },
  aviso: { marginTop: 6, borderLeftWidth: 2, borderLeftColor: C.naranja, paddingLeft: 10 },

  // Renglones
  renglon: { borderBottomWidth: 0.7, borderBottomColor: C.linea, height: 22 },

  // Bloques
  bloque: { marginTop: 26 },
  kv: { flexDirection: "row", marginBottom: 6 },
  kvK: { width: 150, fontFamily: F.mono, fontSize: 8, color: C.gris, paddingTop: 2, textTransform: "uppercase", letterSpacing: 0.6 },
  kvV: { flex: 1, fontSize: 10.5, color: C.tinta },
});

// --- Utilidades -----------------------------------------------------------------

/** Helvetica built-in usa WinAnsi: reemplazamos lo que no tiene. */
function t(txt: string): string {
  return txt
    .replace(/\s*≠\s*/g, " no es ")
    .replace(/\s*→\s*/g, " › ")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}️]/gu, "");
}

function comoArray(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).filter((x) => typeof x === "string" && x.trim() !== "");
}

function comoTexto(v: string | string[] | undefined): string | undefined {
  const a = comoArray(v);
  return a.length ? a[0] : undefined;
}

/** Resalta los tramos en MAYÚSCULAS que arma armarTarjeta (la operación, la preferencia). */
function Resaltado({ texto, style }: { texto: string; style?: Styles[string] }) {
  const partes = t(texto).split(/([A-ZÁÉÍÓÚÑÜ]{3,}(?:[ ,]+[A-ZÁÉÍÓÚÑÜ]+)*)/);
  return (
    <Text style={style}>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={s.resaltado}>
            {p.toLowerCase()}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

function Renglones({ n }: { n: number }) {
  return (
    <View>
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={s.renglon} />
      ))}
    </View>
  );
}

function Pie() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Laboratorio de IA · BBVA · Sebastián Chumbita y Marco Rossi</Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function Encabezado({ kicker, titulo, pregunta }: { kicker: string; titulo: string; pregunta?: string }) {
  return (
    <View>
      <Text style={s.kicker}>{kicker}</Text>
      <Text style={s.h1}>{t(titulo)}</Text>
      {pregunta ? <Text style={s.pregunta}>{t(pregunta)}</Text> : null}
      <View style={s.regla} />
    </View>
  );
}

// --- Portada --------------------------------------------------------------------

function Portada({ nombre, area, logo }: { nombre: string; area?: string; logo: string | null }) {
  return (
    <Page size="A4" style={[s.page, s.pagePapel, { paddingTop: 64 }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[s.kicker, { color: C.tinta }]}>Laboratorio de IA · BBVA</Text>
        {logo ? (
          <View style={{ backgroundColor: "#ffffff", paddingVertical: 8, paddingHorizontal: 12 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logo} style={{ width: 78, height: 27 }} />
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text style={[s.kicker, s.kickerNaranja, { marginBottom: 14 }]}>Guía de la clase</Text>
        <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 36, lineHeight: 1.12, color: C.tinta }}>{t(GUIA_TITULO).replace(" · ", "\n")}</Text>
        <Text style={{ fontSize: 15, lineHeight: 1.4, color: C.grafito, marginTop: 16, maxWidth: 400 }}>
          {t(GUIA_SUBTITULO)}
        </Text>

        <View style={{ marginTop: 54, alignSelf: "flex-start" }}>
          <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 20, color: C.tinta }}>{t(BBVA_TESIS)}</Text>
          <View style={{ height: 4, backgroundColor: C.naranja, marginTop: 5 }} />
        </View>
      </View>

      <View style={{ borderTopWidth: 1.2, borderTopColor: C.tinta, paddingTop: 14, marginBottom: 6 }}>
        <Text style={[s.kicker, { color: C.gris, marginBottom: 4 }]}>Preparada para</Text>
        <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 14, color: C.tinta }}>
          {t(nombre)}
          {area ? <Text style={{ fontFamily: F.regular, color: C.grafito }}>{`  ·  ${t(area)}`}</Text> : null}
        </Text>
        <Text style={{ fontFamily: F.mono, fontSize: 9, color: C.grafito, marginTop: 6 }}>{BBVA_FECHA}</Text>
      </View>
      <Pie />
    </Page>
  );
}

// --- Tu tarjeta -----------------------------------------------------------------

function FichaTarjeta({ tarjeta }: { tarjeta: TarjetaCandidato }) {
  const filas: [string, string][] = [
    ["Dónde buscar", tarjeta.busca],
    ["Tu hipótesis inicial", tarjeta.hipotesis],
    ["Lo que queda en tus manos", tarjeta.humano],
    ["Siguiente paso", tarjeta.siguiente],
  ];
  return (
    <View style={s.ficha} wrap={false}>
      <Text style={s.kicker}>Tu tarjeta · Actividad 5</Text>
      <Text style={s.fichaTitulo}>{t(tarjeta.titulo)}</Text>
      {filas.map(([k, v]) => (
        <View key={k} style={s.fichaFila}>
          <Text style={s.fichaEtq}>{k}</Text>
          <Resaltado texto={v} style={s.fichaTxt} />
        </View>
      ))}
      {tarjeta.aviso ? (
        <View style={s.aviso}>
          <Text style={[s.p, { fontSize: 9.5 }]}>{t(tarjeta.aviso)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Formula({ borrador }: { borrador?: TarjetaCandidato["formula"] }) {
  return (
    <View>
      {BBVA_FORMULA.map((f) => {
        const pista = borrador?.[f.id];
        return (
          <View key={f.id} style={{ marginBottom: 3 }} wrap={false}>
            <Text style={[s.p, { color: C.tinta }]}>{t(f.antes)}…</Text>
            <View style={[s.renglon, { height: 20, justifyContent: "flex-end", paddingBottom: 4 }]}>
              <Text style={{ fontFamily: F.regular, fontStyle: "italic", fontSize: 9.5, lineHeight: 1.2, color: pista ? C.pizarra : C.gris }}>
                {pista ? t(pista.toLowerCase()) : `ej.: ${t(f.placeholder)}`}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TuTarjeta({ respuestas }: { respuestas: DatosGuia["respuestas"] }) {
  const a5 = respuestas.bbva_a5 ?? {};
  const q = {
    q1: comoTexto(a5.q1),
    q2: comoTexto(a5.q2),
    q3: comoTexto(a5.q3),
    q4: comoTexto(a5.q4),
  };
  const completa = !!(q.q1 && q.q2 && q.q3 && q.q4);
  const tarjeta = completa ? armarTarjeta(q) : null;
  const hipotesis = comoTexto(a5.hipotesis)?.trim();

  const act1 = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a1");
  const act3 = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a3");
  const ops = act1 ? comoArray(respuestas.bbva_a1?.ops).map((o) => labelOpcion(act1, "ops", o)) : [];
  const nivelId = comoTexto(respuestas.bbva_a3?.nivel);
  const nivel = act3 && nivelId ? labelOpcion(act3, "nivel", nivelId) : undefined;

  return (
    <Page size="A4" style={s.page}>
      <Encabezado
        kicker="Tu recorrido de hoy"
        titulo={tarjeta ? "Tu candidato" : "Tu hipótesis"}
        pregunta="Una dirección para explorar, no una respuesta definitiva."
      />

      {tarjeta ? <FichaTarjeta tarjeta={tarjeta} /> : null}

      {hipotesis ? (
        <View style={s.bloque} wrap={false}>
          <Text style={[s.kicker, { marginBottom: 8 }]}>Tu hipótesis</Text>
          <View style={{ borderLeftWidth: 3, borderLeftColor: C.naranja, paddingLeft: 14, paddingVertical: 2 }}>
            <Text style={{ fontFamily: F.regular, fontStyle: "italic", fontSize: 12.5, lineHeight: 1.5, color: C.tinta }}>
              {`“${t(hipotesis)}”`}
            </Text>
          </View>
        </View>
      ) : (
        <View style={tarjeta ? { marginTop: 18 } : undefined}>
          <Text style={[s.kicker, { marginBottom: 4 }]} minPresenceAhead={120}>Escribí tu hipótesis</Text>
          <Text style={[s.small, { marginBottom: 8 }]}>
            {tarjeta
              ? "Completala a mano. En gris, el borrador que surge de tus respuestas."
              : "Completala a mano, pensando en algo de tu trabajo que hacés todas las semanas."}
          </Text>
          <Formula borrador={tarjeta?.formula} />
        </View>
      )}

      {ops.length || nivel ? (
        <View style={s.bloque} wrap={false}>
          <Text style={[s.kicker, { marginBottom: 10 }]}>Lo que respondiste</Text>
          {ops.length ? (
            <View style={s.kv}>
              <Text style={s.kvK}>Lo que más hacés</Text>
              <Text style={s.kvV}>{ops.map(t).join("  ·  ")}</Text>
            </View>
          ) : null}
          {nivel ? (
            <View style={s.kv}>
              <Text style={s.kvK}>Autonomía que darías</Text>
              <Text style={s.kvV}>{`Hasta: ${t(nivel)}`}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <Pie />
    </Page>
  );
}

// --- Partes ---------------------------------------------------------------------

function Parte({ numero, parte }: { numero: number; parte: ParteGuia }) {
  return (
    <Page size="A4" style={s.page}>
      <Encabezado kicker={`Parte ${numero} · ${parte.docente}`} titulo={parte.pregunta} />
      {parte.ideas.map((idea, i) => (
        <View key={i} style={s.idea} wrap={false}>
          <Text style={s.ideaNum}>{String(i + 1).padStart(2, "0")}</Text>
          <View style={s.ideaBody}>
            <Text style={s.h3}>{t(idea.titulo)}</Text>
            <Text style={s.p}>{t(idea.texto)}</Text>
            {idea.puntos?.length ? (
              <View style={s.puntos}>
                {idea.puntos.map((pt, j) => (
                  <View key={j} style={s.punto}>
                    <View style={s.vineta} />
                    <Text style={s.puntoTxt}>{t(pt)}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ))}
      <Pie />
    </Page>
  );
}

// --- Desarmá tu trabajo ---------------------------------------------------------

function Desarma() {
  return (
    <Page size="A4" style={s.page}>
      <Encabezado
        kicker="Hoja de trabajo"
        titulo="Desarmá tu trabajo"
        pregunta="Elegí un proceso concreto y recorrelo paso a paso."
      />
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.kicker, { color: C.gris, marginBottom: 2 }]}>El proceso</Text>
        <Renglones n={1} />
      </View>
      {GUIA_DESARMA.map((preg, i) => (
        <View key={i} style={{ marginBottom: 12 }} wrap={false}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ width: 22, fontFamily: F.mono, fontSize: 9, color: C.naranja }}>{i + 1}</Text>
            <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 11, color: C.tinta }}>{t(preg)}</Text>
          </View>
          <View style={{ marginLeft: 22 }}>
            <Renglones n={2} />
          </View>
        </View>
      ))}
      <Pie />
    </Page>
  );
}

// --- Lo que eligió el grupo -------------------------------------------------------

function Grupo({ grupo }: { grupo: ResultadosBbva }) {
  const act1 = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a1");
  const conteo = grupo.items?.ops ?? {};
  const top = Object.entries(conteo)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (!act1 || !top.length) return null;
  const max = top[0][1];
  const base = grupo.respondieron || grupo.respondieronItem?.ops || 0;

  return (
    <View wrap={false} style={{ marginBottom: 26 }}>
      <Text style={[s.kicker, { marginBottom: 4 }]}>Actividad 1 · Nube de operaciones</Text>
      <Text style={[s.h3, { fontSize: 16, marginBottom: 4 }]}>Lo que eligió el grupo</Text>
      <Text style={[s.small, { marginBottom: 14 }]}>
        {`“En un día normal, ¿qué hacés más?”${base ? ` · ${base} ${base === 1 ? "persona" : "personas"} respondieron` : ""}`}
      </Text>
      {top.map(([id, n], i) => (
        <View key={id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
          <Text style={{ width: 120, fontSize: 10, color: C.tinta, fontWeight: i === 0 ? 700 : 400 }}>
            {t(labelOpcion(act1, "ops", id))}
          </Text>
          <View style={{ flex: 1, height: 12, backgroundColor: C.papel }}>
            <View
              style={{
                width: `${Math.max(3, (n / max) * 100)}%`,
                height: 12,
                backgroundColor: i === 0 ? C.naranja : C.pizarra,
              }}
            />
          </View>
          <Text style={{ width: 44, textAlign: "right", fontFamily: F.mono, fontSize: 9, color: C.grafito }}>
            {base ? `${Math.round((n / base) * 100)}%` : String(n)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// --- Cierre ---------------------------------------------------------------------

function Cierre({ grupo }: { grupo?: ResultadosBbva | null }) {
  const proximo = GUIA_PROXIMO.replace(/^Para el próximo encuentro:\s*/i, "");
  return (
    <Page size="A4" style={s.page}>
      {grupo ? <Grupo grupo={grupo} /> : null}

      <View wrap={false}>
        <Text style={[s.kicker, { marginBottom: 4 }]}>El recorrido del laboratorio</Text>
        <Text style={[s.h3, { fontSize: 16, marginBottom: 16 }]}>Dónde estamos</Text>
        {BBVA_RECORRIDO.map((e, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 0 }}>
            <View style={{ width: 28, alignItems: "center" }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  marginTop: 4,
                  backgroundColor: e.hoy ? C.naranja : C.blanco,
                  borderWidth: 1.5,
                  borderColor: e.hoy ? C.naranja : C.gris,
                }}
              />
              {i < BBVA_RECORRIDO.length - 1 ? (
                <View style={{ width: 1.2, flex: 1, backgroundColor: C.linea, marginTop: 2 }} />
              ) : null}
            </View>
            <View
              style={[
                { flex: 1, marginLeft: 8, marginBottom: 8, paddingVertical: 7, paddingHorizontal: 12 },
                e.hoy ? { backgroundColor: C.papel, borderLeftWidth: 2, borderLeftColor: C.naranja } : {},
              ]}
            >
              <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 11, color: e.hoy ? C.tinta : C.grafito }}>
                {t(e.etapa)}
                {e.hoy ? <Text style={{ fontFamily: F.mono, fontSize: 8, color: C.naranja }}>{"   HOY"}</Text> : null}
              </Text>
              <Text style={[s.p, { fontSize: 10, marginTop: 2 }]}>{t(e.pregunta)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[s.ficha, { marginTop: 14 }]} wrap={false}>
        <Text style={[s.kicker, s.kickerNaranja, { marginBottom: 6 }]}>Para el próximo encuentro</Text>
        <Text style={[s.fichaTxt, { lineHeight: 1.55 }]}>{t(proximo.charAt(0).toUpperCase() + proximo.slice(1))}</Text>
        <View style={{ marginTop: 14, alignItems: "flex-start" }}>
          <Text style={{ fontFamily: F.regular, fontWeight: 700, fontSize: 13, color: C.tinta }}>{t(BBVA_TESIS)}.</Text>
          <View style={{ height: 3, width: 60, backgroundColor: C.naranja, marginTop: 4 }} />
        </View>
      </View>
      <Pie />
    </Page>
  );
}

// --- Documento ------------------------------------------------------------------

function GuiaDoc({ d, logo }: { d: DatosGuia; logo: string | null }) {
  const nombre = d.nombre?.trim() || "Participante";
  const area = getArea(d.area)?.label;
  const grupoConDatos = d.grupo && Object.values(d.grupo.items?.ops ?? {}).some((n) => n > 0) ? d.grupo : null;
  return (
    <Document title={`${GUIA_TITULO} · ${nombre}`} author="Sebastián Chumbita y Marco Rossi" subject={GUIA_SUBTITULO}>
      <Portada nombre={nombre} area={area} logo={logo} />
      <TuTarjeta respuestas={d.respuestas ?? {}} />
      <Parte numero={1} parte={GUIA_CHUMBITA} />
      <Parte numero={2} parte={GUIA_MARCO} />
      <Desarma />
      <Cierre grupo={grupoConDatos} />
    </Document>
  );
}

/** Trae el logo como data URI (si falla, la portada sale sin logo). */
async function cargarLogo(): Promise<string | null> {
  if (typeof window === "undefined" || !window.location?.origin) return null;
  try {
    const res = await fetch(`${window.location.origin}/bbva/logo-bbva.png`);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return `data:image/png;base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

let silabeoDesactivado = false;

export async function buildGuiaBlob(d: DatosGuia): Promise<Blob> {
  if (!silabeoDesactivado) {
    // El silabeo por defecto es en inglés: cortaría mal las palabras en castellano.
    Font.registerHyphenationCallback((palabra) => [palabra]);
    silabeoDesactivado = true;
  }
  const logo = await cargarLogo();
  return pdf(<GuiaDoc d={d} logo={logo} />).toBlob();
}
