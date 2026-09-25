"use client";

// Caso A de la demo · "Línea de tiempo del expediente".
// La versión "ensayada" de lo que produce cada instrucción (lib/congreso.ts,
// CONG_CASOS). Cada versión suma lo de la anterior:
//   V1  primera versión. La línea de tiempo se arma con un objeto indexado por
//       fecha: dos actuaciones del mismo día se pisan y queda la última cargada.
//   V2  varias actuaciones el mismo día, agrupadas bajo la fecha, en orden de carga.
//   V3  color según quién la produjo (actor, demandado, tribunal) + estrella.
//   V4  plazos en días hábiles y panel de plazos pendientes. Sólo saltea sábados
//       y domingos: a propósito NO contempla feriados ni feria judicial.

import { useState, useSyncExternalStore, type FormEvent } from "react";

type Version = 1 | 2 | 3 | 4;
type Parte = "Actor" | "Demandado" | "Tribunal";

interface Actuacion {
  id: number;
  /** AAAA-MM-DD */
  fecha: string;
  tipo: string;
  parte: Parte;
  descripcion: string;
  /** V3: marcada con estrella. */
  importante: boolean;
  /** V4: días hábiles del plazo que abre (null = no abre plazo). */
  plazoDias: number | null;
  plazoCumplido: boolean;
}

interface Grupo {
  fecha: string;
  items: Actuacion[];
}

interface Borrador {
  fecha: string;
  tipo: string;
  parte: Parte;
  descripcion: string;
  abrePlazo: boolean;
  dias: string;
}

interface Pendiente {
  actuacion: Actuacion;
  vence: string;
  /** Días hábiles que faltan (0 = vence hoy; negativo = vencido). */
  quedan: number;
}

const TIPOS = [
  "Demanda",
  "Traslado",
  "Contestación de demanda",
  "Apertura a prueba",
  "Ofrecimiento de prueba",
  "Audiencia",
  "Pericia",
  "Alegatos",
  "Sentencia",
  "Recurso",
  "Otra",
];
const PARTES: Parte[] = ["Actor", "Demandado", "Tribunal"];

const EXPEDIENTE = {
  caratula: "Pérez, Lucía c/ Transportes del Norte S.A. s/ daños y perjuicios",
  numero: "Expte. 1234/2024",
  juzgado: "Juzgado Civil y Comercial Común de la IIIa Nominación · Tucumán",
};

const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// V3: un color por parte.
const COLORES: Record<Parte, { borde: string; punto: string; etiqueta: string }> = {
  Actor: { borde: "border-l-blue-500", punto: "bg-blue-500", etiqueta: "bg-blue-50 text-blue-700 ring-blue-200" },
  Demandado: { borde: "border-l-orange-500", punto: "bg-orange-500", etiqueta: "bg-orange-50 text-orange-700 ring-orange-200" },
  Tribunal: { borde: "border-l-emerald-500", punto: "bg-emerald-500", etiqueta: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

const campo =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const etiqueta = "text-[15px] font-medium text-slate-700";

// --- Fechas ----------------------------------------------------------------------

function hoyLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const sinSuscripcion = () => () => {};

/** La fecha de hoy (sólo en el navegador: en el servidor es null). */
function useHoy(): string | null {
  return useSyncExternalStore(sinSuscripcion, hoyLocal, () => null);
}

function aFecha(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function aISO(f: Date): string {
  return f.toISOString().slice(0, 10);
}

function formatear(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function diaSemana(iso: string): string {
  return DIAS[aFecha(iso).getUTCDay()];
}

/** Hábil = de lunes a viernes. No contempla feriados ni feria judicial. */
function esHabil(f: Date): boolean {
  const d = f.getUTCDay();
  return d !== 0 && d !== 6;
}

/** Suma (o resta, si n es negativo) días hábiles a una fecha. */
function sumarDiasHabiles(iso: string, n: number): string {
  const f = aFecha(iso);
  const paso = n >= 0 ? 1 : -1;
  let faltan = Math.abs(n);
  while (faltan > 0) {
    f.setUTCDate(f.getUTCDate() + paso);
    if (esHabil(f)) faltan--;
  }
  return aISO(f);
}

/** Días hábiles desde `desde` (excluido) hasta `hasta` (incluido). Negativo si `hasta` ya pasó. */
function diasHabilesEntre(desde: string, hasta: string): number {
  if (desde === hasta) return 0;
  const paso = hasta > desde ? 1 : -1;
  const f = aFecha(desde);
  let n = 0;
  while (aISO(f) !== hasta) {
    f.setUTCDate(f.getUTCDate() + paso);
    if (esHabil(f)) n += paso;
  }
  return n;
}

// --- Datos de ejemplo -----------------------------------------------------------------

type Fila = [fecha: string, tipo: string, parte: Parte, descripcion: string, plazoDias?: number, cumplido?: boolean];

function ejemplo(hoy: string): Actuacion[] {
  // Las últimas actuaciones se ubican cerca de hoy para que los plazos tengan sentido.
  const hace = (dias: number) => sumarDiasHabiles(hoy, -dias);
  const filas: Fila[] = [
    [
      "2024-12-02",
      "Demanda",
      "Actor",
      "Lucía Pérez demanda a Transportes del Norte S.A. por el choque del 12/08/2023 en Av. Mate de Luna y Av. Mitre. Reclama $ 18.500.000 más intereses.",
    ],
    ["2024-12-16", "Traslado", "Tribunal", "Se da trámite a la demanda y se corre traslado a la demandada por 15 días.", 15, true],
    [
      "2025-03-14",
      "Contestación de demanda",
      "Demandado",
      "Transportes del Norte S.A. contesta la demanda: niega los hechos y atribuye el choque a la actora.",
    ],
    [
      "2025-03-14",
      "Ofrecimiento de prueba",
      "Demandado",
      "La demandada ofrece prueba documental, testimonial (dos testigos) y pericial mecánica.",
    ],
    ["2025-04-10", "Apertura a prueba", "Tribunal", "Se abre la causa a prueba por 40 días.", 40, true],
    ["2025-05-06", "Audiencia", "Tribunal", "Audiencia de prueba: declaran los testigos ofrecidos por las partes."],
    [
      hace(15),
      "Pericia",
      "Tribunal",
      "El perito ingeniero mecánico, Ing. Ramiro Soria, presenta su informe: el colectivo circulaba a unos 62 km/h.",
    ],
    [hace(9), "Traslado", "Tribunal", "Se corre traslado del informe pericial a las partes por 5 días.", 5, true],
    [hace(5), "Otra", "Actor", "La actora pide explicaciones al perito sobre el cálculo de la velocidad."],
    [hace(3), "Traslado", "Tribunal", "Se corre traslado al perito del pedido de explicaciones por 5 días.", 5, false],
    [hace(2), "Otra", "Demandado", "La demandada impugna la pericia y acompaña el informe de su consultor técnico."],
    [hace(1), "Traslado", "Tribunal", "Se corre traslado a la actora de la impugnación de la pericia por 5 días.", 5, false],
  ];
  return filas.map(([fecha, tipo, parte, descripcion, plazoDias, cumplido], i) => ({
    id: i + 1,
    fecha,
    tipo,
    parte,
    descripcion,
    importante: false,
    plazoDias: plazoDias ?? null,
    plazoCumplido: cumplido ?? false,
  }));
}

function nuevoBorrador(fecha: string): Borrador {
  return { fecha, tipo: TIPOS[0], parte: "Actor", descripcion: "", abrePlazo: false, dias: "5" };
}

function siguienteId(lista: Actuacion[]): number {
  return lista.reduce((max, a) => Math.max(max, a.id), 0) + 1;
}

// --- Armado de la línea de tiempo --------------------------------------------------------

/** V1: una entrada por fecha (se indexa por fecha). */
function unaPorFecha(lista: Actuacion[]): Grupo[] {
  const porFecha: Record<string, Actuacion> = {};
  for (const a of lista) porFecha[a.fecha] = a;
  return Object.keys(porFecha)
    .sort()
    .map((fecha) => ({ fecha, items: [porFecha[fecha]] }));
}

/** V2: todas las actuaciones, agrupadas por fecha y en el orden en que se cargaron. */
function agruparPorFecha(lista: Actuacion[]): Grupo[] {
  const grupos = new Map<string, Actuacion[]>();
  for (const a of [...lista].sort((x, y) => x.id - y.id)) {
    const items = grupos.get(a.fecha) ?? [];
    items.push(a);
    grupos.set(a.fecha, items);
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([fecha, items]) => ({ fecha, items }));
}

/** V4: plazos abiertos y no cumplidos, del más próximo al más lejano. */
function plazosPendientes(lista: Actuacion[], hoy: string): Pendiente[] {
  return lista
    .flatMap((a) => {
      if (a.plazoDias === null || a.plazoCumplido) return [];
      const vence = sumarDiasHabiles(a.fecha, a.plazoDias);
      return [{ actuacion: a, vence, quedan: diasHabilesEntre(hoy, vence) }];
    })
    .sort((x, y) => x.vence.localeCompare(y.vence));
}

function textoQuedan(quedan: number): string {
  if (quedan < 0) return `Vencido hace ${-quedan} ${-quedan === 1 ? "día hábil" : "días hábiles"}`;
  if (quedan === 0) return "Vence hoy";
  if (quedan === 1) return "Queda 1 día hábil";
  return `Quedan ${quedan} días hábiles`;
}

function colorQuedan(quedan: number): string {
  if (quedan < 0) return "bg-red-600 text-white";
  if (quedan <= 2) return "bg-red-50 text-red-700 ring-1 ring-red-200";
  if (quedan <= 5) return "bg-amber-50 text-amber-800 ring-1 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

// --- Componente ------------------------------------------------------------------------

export function Cronologia({ v }: { v: Version }) {
  const hoy = useHoy();
  return (
    <div
      className="@container h-full w-full overflow-auto bg-white text-[17px] leading-relaxed text-slate-900 [color-scheme:light]"
      style={{ fontFamily: FUENTE }}
    >
      {hoy ? <App v={v} hoy={hoy} /> : <Encabezado />}
    </div>
  );
}

function App({ v, hoy }: { v: Version; hoy: string }) {
  // Lo que suma cada versión (acumulativo).
  const variasPorDia = v >= 2;
  const conColores = v >= 3;
  const conPlazos = v >= 4;

  const [actuaciones, setActuaciones] = useState<Actuacion[]>(() => ejemplo(hoy));
  const [borrador, setBorrador] = useState<Borrador>(() => nuevoBorrador(hoy));
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const grupos = variasPorDia ? agruparPorFecha(actuaciones) : unaPorFecha(actuaciones);
  const mostradas = grupos.reduce((n, g) => n + g.items.length, 0);
  const pendientes = conPlazos ? plazosPendientes(actuaciones, hoy) : [];

  const diasBorrador = Number.parseInt(borrador.dias, 10);
  const plazoBorrador = conPlazos && borrador.abrePlazo && diasBorrador > 0 ? Math.min(diasBorrador, 365) : null;

  function actualizar(cambios: Partial<Borrador>) {
    setBorrador((b) => ({ ...b, ...cambios }));
  }

  function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!borrador.fecha) return;
    const datos = {
      fecha: borrador.fecha,
      tipo: borrador.tipo,
      parte: borrador.parte,
      descripcion: borrador.descripcion.trim(),
    };
    if (editandoId === null) {
      setActuaciones((lista) => [
        ...lista,
        { id: siguienteId(lista), ...datos, importante: false, plazoDias: plazoBorrador, plazoCumplido: false },
      ]);
    } else {
      setActuaciones((lista) =>
        lista.map((a) => {
          if (a.id !== editandoId) return a;
          const editada = { ...a, ...datos };
          if (!conPlazos) return editada;
          return { ...editada, plazoDias: plazoBorrador, plazoCumplido: plazoBorrador === null ? false : a.plazoCumplido };
        }),
      );
    }
    setBorrador(nuevoBorrador(hoy));
    setEditandoId(null);
  }

  function editar(a: Actuacion) {
    setEditandoId(a.id);
    setBorrador({
      fecha: a.fecha,
      tipo: a.tipo,
      parte: a.parte,
      descripcion: a.descripcion,
      abrePlazo: a.plazoDias !== null,
      dias: String(a.plazoDias ?? 5),
    });
  }

  function cancelar() {
    setEditandoId(null);
    setBorrador(nuevoBorrador(hoy));
  }

  function eliminar(id: number) {
    setActuaciones((lista) => lista.filter((a) => a.id !== id));
    if (editandoId === id) cancelar();
  }

  function alternarImportante(id: number) {
    setActuaciones((lista) => lista.map((a) => (a.id === id ? { ...a, importante: !a.importante } : a)));
  }

  function alternarCumplido(id: number) {
    setActuaciones((lista) => lista.map((a) => (a.id === id ? { ...a, plazoCumplido: !a.plazoCumplido } : a)));
  }

  function restablecer() {
    setActuaciones(ejemplo(hoy));
    cancelar();
  }

  return (
    <>
      <Encabezado onRestablecer={restablecer} />

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6 @3xl:px-8 @3xl:py-8">
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expediente</p>
          <p className="mt-0.5 text-lg font-semibold leading-snug">{EXPEDIENTE.caratula}</p>
          <p className="text-slate-600">
            {EXPEDIENTE.numero} · {EXPEDIENTE.juzgado}
          </p>
        </section>

        {conPlazos && <PanelPlazos pendientes={pendientes} hoy={hoy} onCumplido={alternarCumplido} />}

        <div className="grid gap-6 @4xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)] @4xl:items-start">
          {/* Formulario */}
          <form
            onSubmit={guardar}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm @4xl:sticky @4xl:top-28"
          >
            <h2 className="text-xl font-semibold">{editandoId === null ? "Nueva actuación" : "Editar actuación"}</h2>

            <label className="block">
              <span className={etiqueta}>Fecha</span>
              <input
                type="date"
                required
                value={borrador.fecha}
                onChange={(e) => actualizar({ fecha: e.target.value })}
                className={campo}
              />
            </label>

            <label className="block">
              <span className={etiqueta}>Tipo de actuación</span>
              <select value={borrador.tipo} onChange={(e) => actualizar({ tipo: e.target.value })} className={campo}>
                {TIPOS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={etiqueta}>Parte que la produjo</span>
              <select
                value={borrador.parte}
                onChange={(e) => actualizar({ parte: e.target.value as Parte })}
                className={campo}
              >
                {PARTES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className={etiqueta}>Descripción</span>
              <textarea
                rows={3}
                value={borrador.descripcion}
                onChange={(e) => actualizar({ descripcion: e.target.value })}
                placeholder="Qué se presentó o resolvió…"
                className={`${campo} resize-y`}
              />
            </label>

            {conPlazos && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <label className="flex items-center gap-2.5 font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={borrador.abrePlazo}
                    onChange={(e) => actualizar({ abrePlazo: e.target.checked })}
                    className="h-5 w-5 accent-indigo-600"
                  />
                  Esta actuación abre un plazo
                </label>
                {borrador.abrePlazo && (
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <label className="block w-32">
                      <span className={etiqueta}>Días hábiles</span>
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={borrador.dias}
                        onChange={(e) => actualizar({ dias: e.target.value })}
                        className={campo}
                      />
                    </label>
                    {plazoBorrador !== null && borrador.fecha && (
                      <p className="pb-2.5 text-[15px] text-slate-600">
                        Vence el <strong>{formatear(sumarDiasHabiles(borrador.fecha, plazoBorrador))}</strong>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={!borrador.fecha}
                className="flex-1 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editandoId === null ? "Agregar actuación" : "Guardar cambios"}
              </button>
              {editandoId !== null && (
                <button
                  type="button"
                  onClick={cancelar}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Línea de tiempo */}
          <section>
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold">Línea de tiempo</h2>
              <span className="text-[15px] text-slate-500">
                {mostradas} {mostradas === 1 ? "actuación" : "actuaciones"}
              </span>
            </div>

            {conColores && <Leyenda actuaciones={actuaciones} />}

            {grupos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                Todavía no hay actuaciones. Cargá la primera con el formulario.
              </p>
            ) : (
              <ol className="relative ml-3 border-l-2 border-slate-200">
                {grupos.map((g) => (
                  <li key={g.fecha} className="relative pb-8 pl-8 last:pb-1">
                    <span className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-4 border-white bg-indigo-600 ring-2 ring-indigo-100" />
                    <p className="mb-3 flex flex-wrap items-baseline gap-x-2">
                      <span className="text-lg font-bold text-indigo-700">{formatear(g.fecha)}</span>
                      <span className="text-[15px] text-slate-500">{diaSemana(g.fecha)}</span>
                      {g.items.length > 1 && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-sm font-semibold text-indigo-700">
                          {g.items.length} actuaciones
                        </span>
                      )}
                    </p>
                    <div className="space-y-3">
                      {g.items.map((a) => (
                        <Tarjeta
                          key={a.id}
                          a={a}
                          conColores={conColores}
                          conPlazos={conPlazos}
                          editando={editandoId === a.id}
                          onEditar={() => editar(a)}
                          onEliminar={() => eliminar(a.id)}
                          onEstrella={() => alternarImportante(a.id)}
                          onCumplido={() => alternarCumplido(a.id)}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function Encabezado({ onRestablecer }: { onRestablecer?: () => void }) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 @3xl:px-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path d="M6 3v18" strokeLinecap="round" />
            <circle cx="6" cy="6" r="2" fill="currentColor" />
            <circle cx="6" cy="12" r="2" fill="currentColor" />
            <circle cx="6" cy="18" r="2" fill="currentColor" />
            <path d="M11 6h8M11 12h6M11 18h8" strokeLinecap="round" />
          </svg>
        </div>
        <div className="min-w-0 flex-1 basis-48">
          <h1 className="text-xl font-bold tracking-tight @xl:text-2xl">Línea de tiempo del expediente</h1>
          <p className="truncate text-base text-slate-500">Cargá las actuaciones y miralas en orden cronológico.</p>
        </div>
        {onRestablecer && (
          <button
            type="button"
            onClick={onRestablecer}
            className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[15px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Restablecer ejemplo
          </button>
        )}
      </div>
    </header>
  );
}

function Tarjeta({
  a,
  conColores,
  conPlazos,
  editando,
  onEditar,
  onEliminar,
  onEstrella,
  onCumplido,
}: {
  a: Actuacion;
  conColores: boolean;
  conPlazos: boolean;
  editando: boolean;
  onEditar: () => void;
  onEliminar: () => void;
  onEstrella: () => void;
  onCumplido: () => void;
}) {
  const destacada = conColores && a.importante;
  return (
    <article
      className={[
        "rounded-xl border border-slate-200 p-4 shadow-sm transition",
        conColores ? `border-l-4 ${COLORES[a.parte].borde}` : "",
        destacada ? "bg-amber-50 ring-2 ring-amber-300" : "bg-white",
        editando ? "outline-2 outline-offset-2 outline-indigo-500" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-snug">{a.tipo}</h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ${
                conColores ? COLORES[a.parte].etiqueta : "bg-slate-100 text-slate-600 ring-slate-200"
              }`}
            >
              {a.parte}
            </span>
            {destacada && <span className="text-sm font-semibold text-amber-700">Importante</span>}
          </div>
          {a.descripcion && <p className="mt-1 text-slate-600">{a.descripcion}</p>}
        </div>
        {conColores && (
          <button
            type="button"
            onClick={onEstrella}
            aria-pressed={a.importante}
            title={a.importante ? "Quitar la estrella" : "Marcar como importante"}
            className={`-mr-1 -mt-1 shrink-0 cursor-pointer rounded-lg px-2 py-0.5 text-2xl leading-none transition hover:bg-amber-100 ${
              a.importante ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
            }`}
          >
            {a.importante ? "★" : "☆"}
          </button>
        )}
      </div>

      {conPlazos && a.plazoDias !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-slate-50 px-3 py-2 text-[15px] text-slate-700">
          <span>
            ⏱ Plazo de {a.plazoDias} días hábiles · vence el <strong>{formatear(sumarDiasHabiles(a.fecha, a.plazoDias))}</strong>
          </span>
          <button
            type="button"
            onClick={onCumplido}
            title={a.plazoCumplido ? "Volver a marcar como pendiente" : "Marcar como cumplido"}
            className={`cursor-pointer rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ${
              a.plazoCumplido
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-800 ring-amber-200"
            }`}
          >
            {a.plazoCumplido ? "✓ Cumplido" : "Pendiente"}
          </button>
        </div>
      )}

      <div className="mt-3 flex justify-end gap-1 text-[15px]">
        <button
          type="button"
          onClick={onEditar}
          className="cursor-pointer rounded-md px-2.5 py-1 font-medium text-slate-500 hover:bg-slate-100 hover:text-indigo-700"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={onEliminar}
          className="cursor-pointer rounded-md px-2.5 py-1 font-medium text-slate-500 hover:bg-red-50 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

function Leyenda({ actuaciones }: { actuaciones: Actuacion[] }) {
  const destacadas = actuaciones.filter((a) => a.importante).length;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[15px]">
      {PARTES.map((p) => (
        <span key={p} className="flex items-center gap-2">
          <span className={`h-3.5 w-3.5 rounded-full ${COLORES[p].punto}`} />
          <span className="font-medium">{p}</span>
          <span className="text-slate-500">({actuaciones.filter((a) => a.parte === p).length})</span>
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-slate-600">
        <span className="text-lg leading-none text-amber-500">★</span> Importante ({destacadas})
      </span>
    </div>
  );
}

function PanelPlazos({
  pendientes,
  hoy,
  onCumplido,
}: {
  pendientes: Pendiente[];
  hoy: string;
  onCumplido: (id: number) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          Plazos pendientes
          <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-sm font-bold text-white">{pendientes.length}</span>
        </h2>
        <p className="text-[15px] text-slate-500">
          Hoy: {diaSemana(hoy)} {formatear(hoy)}
        </p>
      </div>

      {pendientes.length === 0 ? (
        <p className="mt-3 text-slate-500">No hay plazos pendientes.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {pendientes.map(({ actuacion: a, vence, quedan }) => (
            <li key={a.id} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
              <div className="w-36 shrink-0">
                <p className="text-sm text-slate-500">Vence</p>
                <p className="text-lg font-bold leading-tight">{formatear(vence)}</p>
                <p className="text-sm text-slate-500">{diaSemana(vence)}</p>
              </div>
              <div className="min-w-0 flex-1 basis-60">
                <p className="font-semibold">
                  {a.tipo} <span className="font-normal text-slate-500">· {a.parte}</span>
                </p>
                {a.descripcion && <p className="text-slate-600">{a.descripcion}</p>}
                <p className="text-sm text-slate-500">
                  Desde el {formatear(a.fecha)} · {a.plazoDias} días hábiles
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-[15px] font-semibold ${colorQuedan(quedan)}`}>
                {textoQuedan(quedan)}
              </span>
              <button
                type="button"
                onClick={() => onCumplido(a.id)}
                className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Marcar cumplido
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 border-t border-slate-100 pt-3 text-sm italic text-slate-500">
        Días hábiles: de lunes a viernes. No contempla feriados ni feria judicial.
      </p>
    </section>
  );
}
