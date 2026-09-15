"use client";

// El acta de acuerdo de mediación se redacta acá mismo, sobre el documento:
// papel blanco con membrete PGR–UEES, encabezado de comparecencia, antecedentes,
// objeto y cláusulas editables (más las que quieran agregar). Todo se guarda
// solo en la compu y se descarga con el diálogo de impresión (Guardar como PDF).

import { useEffect, useState } from "react";
import { BotonCopiar } from "@/components/taller/piezas";
import { cn } from "@/lib/utils";

const LS_ACTA = "tal-acta";

interface ClausulaFija {
  id: string;
  titulo: string;
  modelo: string;
}

const CLAUSULAS: ClausulaFija[] = [
  {
    id: "c1",
    titulo: "PRIMERA — Instalación del módulo",
    modelo:
      "TecnoFrío Servicios se obliga a instalar el módulo automático de alimentación el día ____ de septiembre de 2026, a las ____ horas, en el local de Café Nube, corriendo a su cargo el retiro y el traslado de la pieza.",
  },
  {
    id: "c2",
    titulo: "SEGUNDA — Prueba de funcionamiento",
    modelo:
      "La instalación se tendrá por finalizada una vez realizada la prueba de funcionamiento de dos horas prevista en el anexo técnico (CN-04), que se llevará a cabo el día ____, en presencia de ambas partes o de quienes ellas designen.",
  },
  {
    id: "c3",
    titulo: "TERCERA — Pago del saldo",
    modelo:
      "Café Nube pagará a TecnoFrío Servicios la suma de USD ____ el día ____, ____ (antes / después) de la prueba de funcionamiento, mediante transferencia a la cuenta ya utilizada entre las partes (CN-07).",
  },
  {
    id: "c4",
    titulo: "CUARTA — Línea eléctrica independiente",
    modelo:
      "La instalación de la línea eléctrica exclusiva para la máquina de hielo, presupuestada en USD 180 (CN-13), será contratada por ____ y su costo será asumido por ____, debiendo encontrarse concluida antes del ____.",
  },
  {
    id: "c5",
    titulo: "QUINTA — Equipo temporal",
    modelo:
      "____ (Se entrega / No se entrega) una máquina de hielo en carácter de préstamo de uso por el plazo de ____, en las siguientes condiciones: ____.",
  },
  {
    id: "c6",
    titulo: "SEXTA — Garantía de funcionamiento",
    modelo:
      "Si dentro de los primeros ____ días los equipos presentaren fallas de funcionamiento no imputables a la instalación eléctrica del local, TecnoFrío Servicios concurrirá a repararlas dentro de las ____ horas de recibido el aviso, sin costo para la contratante.",
  },
  {
    id: "c7",
    titulo: "SÉPTIMA — Confidencialidad",
    modelo:
      "Las manifestaciones vertidas durante el procedimiento de mediación, incluidas las sesiones privadas, revisten carácter confidencial y no podrán ser invocadas como prueba en un proceso judicial o arbitral posterior, conforme a la Ley de Mediación, Conciliación y Arbitraje.",
  },
  {
    id: "c8",
    titulo: "OCTAVA — Incumplimiento y seguimiento",
    modelo:
      "Ante cualquier diferencia sobre la interpretación o el cumplimiento del presente acuerdo, las partes se obligan a intentar una nueva instancia de diálogo ante este mismo equipo de mediación, dentro de los ____ días de suscitada, antes de acudir a la vía judicial.",
  },
];

const ANTECEDENTES_MODELO =
  "1) El 1 de septiembre de 2026 las partes celebraron un contrato de provisión e instalación de equipos de frío (CN-03), por un precio total de USD 3.000, pagadero USD 2.000 contra entrega y USD 1.000 contra instalación finalizada. 2) El 8 de septiembre de 2026 TecnoFrío Servicios entregó tres bultos cerrados según remito CN-06, y Café Nube abonó USD 2.000 mediante transferencia acreditada (CN-07). 3) La instalación no se encuentra finalizada, por la falta del módulo automático de alimentación y de una línea eléctrica independiente (CN-10 y CN-13). 4) El 9 de septiembre de 2026 la señora Herrera solicitó la apertura del presente procedimiento (CN-11).";

const OBJETO_MODELO =
  "Determinar las condiciones de finalización de la instalación contratada, la oportunidad y el monto del pago del saldo, la responsabilidad por la línea eléctrica independiente y la garantía de funcionamiento de los equipos, preservando la relación comercial entre las partes.";

const ORDINALES_EXTRA = ["NOVENA", "DÉCIMA", "DECIMOPRIMERA", "DECIMOSEGUNDA", "DECIMOTERCERA"];

interface Extra {
  titulo: string;
  texto: string;
}
interface Acta {
  campos: Record<string, string>;
  extras: Extra[];
}

function leer(): Acta {
  try {
    const d = JSON.parse(localStorage.getItem(LS_ACTA) ?? "{}");
    return { campos: d.campos ?? {}, extras: d.extras ?? [] };
  } catch {
    return { campos: {}, extras: [] };
  }
}

function actaComoTexto(a: Acta): string {
  const v = (k: string, modelo = "") => (a.campos[k] ?? modelo).trim() || "____";
  const partes = [
    "ACTA DE ACUERDO DE MEDIACIÓN",
    "Caso Café Nube / TecnoFrío Servicios · Ejercicio académico · Taller PGR–UEES 2026",
    "",
    `En la ciudad de San Salvador, República de El Salvador, a las ${v("hora")} horas del día ${v("dia")} de septiembre de dos mil veintiséis, ante el equipo de mediación integrado por ${v("mediadores")}, comparecen: por una parte, LUCÍA HERRERA, mayor de edad, comerciante, propietaria de «Café Nube»; y, por la otra, DIEGO MOLINA, mayor de edad, técnico en refrigeración, titular de «TecnoFrío Servicios»; quienes se sometieron voluntariamente al procedimiento de mediación previsto en la Ley de Mediación, Conciliación y Arbitraje, y EXPONEN:`,
    "",
    `I. ANTECEDENTES. ${v("antecedentes", ANTECEDENTES_MODELO)}`,
    "",
    `II. OBJETO DE LA CONTROVERSIA. ${v("objeto", OBJETO_MODELO)}`,
    "",
    "III. ACUERDO. Las partes, libre y voluntariamente, ACUERDAN las siguientes cláusulas:",
    ...CLAUSULAS.map((c) => `\n${c.titulo}. ${v(c.id, c.modelo)}`),
    ...a.extras.map((e, i) => `\n${ORDINALES_EXTRA[i] ?? "ADICIONAL"} — ${e.titulo || "Cláusula adicional"}. ${e.texto.trim() || "____"}`),
    "",
    "IV. CIERRE. No siendo otro el objeto del presente procedimiento, y previa lectura íntegra de esta acta, las partes la ratifican en todos sus términos y la firman en tres ejemplares de un mismo tenor y a un solo efecto, quedando uno en poder de cada parte y otro en el registro del equipo de mediación. El presente acuerdo obliga a las partes en los términos de la Ley de Mediación, Conciliación y Arbitraje de la República de El Salvador.",
    "",
    "Lucía Herrera — Café Nube · Diego Molina — TecnoFrío Servicios · El equipo de mediación",
    "",
    "Acta ficticia · Taller «IA aplicada a la resolución de conflictos» · PGR–UEES · Semana de la Mediación, El Salvador 2026",
  ];
  return partes.join("\n");
}

const SERIF = { fontFamily: 'Georgia, "Times New Roman", serif' } as const;

export function ActaAcuerdo() {
  const [acta, setActa] = useState<Acta>({ campos: {}, extras: [] });
  const [lista, setLista] = useState(false);

  useEffect(() => {
    setActa(leer());
    setLista(true);
  }, []);

  function guardar(next: Acta) {
    setActa(next);
    try {
      localStorage.setItem(LS_ACTA, JSON.stringify(next));
    } catch {}
  }
  const setCampo = (k: string, v: string) => guardar({ ...acta, campos: { ...acta.campos, [k]: v } });
  const setExtra = (i: number, e: Partial<Extra>) => guardar({ ...acta, extras: acta.extras.map((x, j) => (j === i ? { ...x, ...e } : x)) });

  if (!lista) return null;

  const campo = (k: string, ancho: string, placeholder: string) => (
    <input
      value={acta.campos[k] ?? ""}
      onChange={(e) => setCampo(k, e.target.value)}
      placeholder={placeholder}
      style={SERIF}
      className={cn("mx-1 inline-block border-b border-dotted border-neutral-400 bg-transparent text-center align-baseline outline-none placeholder:text-neutral-400 focus:border-neutral-800", ancho)}
    />
  );

  const bloque = (k: string, modelo: string) => (
    <textarea
      value={acta.campos[k] ?? modelo}
      onChange={(e) => setCampo(k, e.target.value)}
      rows={3}
      style={SERIF}
      className="acta-texto mt-1 w-full resize-none rounded-sm bg-transparent leading-relaxed outline-none transition hover:bg-amber-50 focus:bg-amber-50"
    />
  );

  return (
    <div>
      {/* Barra de acciones (no se imprime) */}
      <div className="no-imprimir mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2.5 text-base font-bold text-ink active:scale-95"
        >
          🖨️ Descargar en PDF
        </button>
        <BotonCopiar texto={actaComoTexto(acta)} label="Copiar el acta" />
        <button
          onClick={() => {
            if (confirm("¿Volver al modelo original? Se pierde lo redactado.")) guardar({ campos: {}, extras: [] });
          }}
          className="rounded-xl border border-line bg-panel/60 px-3 py-2 text-sm text-muted"
        >
          ↺ Modelo original
        </button>
        <p className="w-full text-xs text-faint">
          Se guarda solo en esta compu. «Descargar en PDF» abre el diálogo de impresión: elijan destino <b>«Guardar como PDF»</b>.
        </p>
      </div>

      {/* El acta: papel blanco, membrete institucional, texto editable en el lugar */}
      <div className="acta-imprimible overflow-hidden rounded-xl border border-line bg-white text-[15px] leading-relaxed text-neutral-900 shadow-xl" style={SERIF}>
        {/* Membrete */}
        <div className="flex items-center justify-between gap-4 bg-[#140d39] px-6 py-4">
          <img src="/justicia/logo-pgr.png" alt="Procuraduría General de la República" className="h-12 w-auto" />
          <div className="min-w-0 text-center text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-teal">Semana de la Mediación · El Salvador 2026</p>
            <p className="mt-1 text-sm font-semibold">Taller «IA aplicada a la resolución de conflictos» · PGR – UEES</p>
          </div>
          <img src="/justicia/logo-uees.png" alt="Universidad Evangélica de El Salvador" className="h-12 w-auto rounded-md bg-white p-1" />
        </div>

        <div className="px-7 py-6 sm:px-10">
          <h3 className="text-center text-xl font-bold tracking-wide">ACTA DE ACUERDO DE MEDIACIÓN</h3>
          <p className="mt-1 text-center text-xs text-neutral-500">Caso Café Nube / TecnoFrío Servicios · Ejercicio académico</p>

          <p className="mt-5 text-justify">
            En la ciudad de San Salvador, República de El Salvador, a las
            {campo("hora", "w-16", "hora")} horas del día
            {campo("dia", "w-12", "día")} de septiembre de dos mil veintiséis, ante el equipo de mediación integrado por
            {campo("mediadores", "w-72 max-w-full", "nombre/s de quien/es median")}, comparecen: por una parte, <b>LUCÍA HERRERA</b>, mayor de edad,
            comerciante, propietaria de «Café Nube»; y, por la otra, <b>DIEGO MOLINA</b>, mayor de edad, técnico en refrigeración, titular de
            «TecnoFrío Servicios»; quienes se sometieron voluntariamente al procedimiento de mediación previsto en la Ley de Mediación, Conciliación y
            Arbitraje, y <b>EXPONEN</b>:
          </p>

          <p className="mt-4 font-bold">I. ANTECEDENTES.</p>
          {bloque("antecedentes", ANTECEDENTES_MODELO)}

          <p className="mt-3 font-bold">II. OBJETO DE LA CONTROVERSIA.</p>
          {bloque("objeto", OBJETO_MODELO)}

          <p className="mt-3 text-justify">
            <b>III. ACUERDO.</b> Las partes, libre y voluntariamente, <b>ACUERDAN</b> las siguientes cláusulas:
          </p>

          {CLAUSULAS.map((c) => (
            <div key={c.id} className="mt-3">
              <p className="font-bold">{c.titulo}.</p>
              {bloque(c.id, c.modelo)}
            </div>
          ))}

          {acta.extras.map((e, i) => (
            <div key={i} className="mt-3">
              <p className="font-bold">
                {ORDINALES_EXTRA[i] ?? "ADICIONAL"} —
                <input
                  value={e.titulo}
                  onChange={(ev) => setExtra(i, { titulo: ev.target.value })}
                  placeholder="título de la cláusula"
                  style={SERIF}
                  className="ml-1.5 inline-block w-72 max-w-full border-b border-dotted border-neutral-400 bg-transparent font-bold outline-none placeholder:font-normal placeholder:text-neutral-400 focus:border-neutral-800"
                />
                <button
                  onClick={() => guardar({ ...acta, extras: acta.extras.filter((_, j) => j !== i) })}
                  className="no-imprimir ml-2 rounded border border-neutral-300 px-1.5 text-xs font-normal text-neutral-500 hover:text-red-600"
                  aria-label="Quitar la cláusula"
                >
                  ✕
                </button>
              </p>
              <textarea
                value={e.texto}
                onChange={(ev) => setExtra(i, { texto: ev.target.value })}
                rows={2}
                placeholder="Redacten acá la cláusula…"
                style={SERIF}
                className="acta-texto mt-1 w-full resize-none rounded-sm bg-transparent leading-relaxed outline-none transition placeholder:text-neutral-400 hover:bg-amber-50 focus:bg-amber-50"
              />
            </div>
          ))}

          {acta.extras.length < ORDINALES_EXTRA.length && (
            <button
              onClick={() => guardar({ ...acta, extras: [...acta.extras, { titulo: "", texto: "" }] })}
              className="no-imprimir mt-3 rounded-lg border border-dashed border-neutral-400 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-700"
            >
              + Agregar una cláusula ({ORDINALES_EXTRA[acta.extras.length]})
            </button>
          )}

          <p className="mt-5 text-justify">
            <b>IV. CIERRE.</b> No siendo otro el objeto del presente procedimiento, y previa lectura íntegra de esta acta, las partes la ratifican en
            todos sus términos y la firman en tres ejemplares de un mismo tenor y a un solo efecto, quedando uno en poder de cada parte y otro en el
            registro del equipo de mediación. El presente acuerdo obliga a las partes en los términos de la Ley de Mediación, Conciliación y Arbitraje
            de la República de El Salvador.
          </p>

          <div className="mt-12 flex flex-wrap justify-between gap-6">
            {["Lucía Herrera\nCafé Nube", "Diego Molina\nTecnoFrío Servicios", "El equipo de mediación"].map((f) => (
              <div key={f} className="min-w-40 flex-1 text-center">
                <div className="mx-auto w-4/5 border-b border-neutral-700 pt-8" />
                <p className="mt-1.5 whitespace-pre-line text-xs text-neutral-600">{f}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 border-t border-neutral-200 pt-3 text-center text-[10px] text-neutral-400">
            Acta ficticia, con fines exclusivamente académicos · Taller «IA aplicada a la resolución de conflictos» · PGR–UEES · Semana de la
            Mediación, El Salvador 2026
          </p>
        </div>
      </div>
    </div>
  );
}
