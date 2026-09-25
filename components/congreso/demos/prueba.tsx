"use client";

// Caso B de la demo · "Matriz de hechos y prueba".
// La versión "ensayada" de lo que produce cada instrucción (lib/congreso.ts,
// CONG_CASOS). Cada versión suma lo de la anterior:
//   V1  primera versión. Cada prueba tiene UN select "Acredita el hecho…": sólo
//       puede vincularse a un hecho; elegir otro la mueve (la desvincula del anterior).
//   V2  vínculos de muchos a muchos: la pericia puede acreditar los hechos 2 y 3.
//   V3  hechos sin ninguna prueba en rojo + contador arriba.
//   V4  carga de la prueba por hecho (actor/demandado), estado de cada prueba
//       (ofrecida/producida/desistida) y resumen de lo que falta producir.
//       Una prueba desistida no acredita nada.

import { useState, type FormEvent } from "react";

type Version = 1 | 2 | 3 | 4;
type TipoPrueba = "Documental" | "Testimonial" | "Pericial" | "Informativa";
type Carga = "Actor" | "Demandado";
type Estado = "Ofrecida" | "Producida" | "Desistida";

interface Hecho {
  id: number;
  texto: string;
  /** V4: quién tiene la carga de probarlo. */
  carga: Carga;
}

interface Prueba {
  id: number;
  descripcion: string;
  tipo: TipoPrueba;
  /** Hechos que acredita (en la V1, como mucho uno). */
  hechos: number[];
  /** V4 */
  estado: Estado;
}

type Edicion = { clase: "hecho"; id: number; texto: string } | { clase: "prueba"; id: number; texto: string; tipo: TipoPrueba };

const TIPOS: TipoPrueba[] = ["Documental", "Testimonial", "Pericial", "Informativa"];
const CARGAS: Carga[] = ["Actor", "Demandado"];
const ESTADOS: Estado[] = ["Ofrecida", "Producida", "Desistida"];

const EXPEDIENTE = {
  caratula: "Pérez, Lucía c/ Transportes del Norte S.A. s/ daños y perjuicios",
  numero: "Expte. 1234/2024",
  juzgado: "Juzgado Civil y Comercial Común de la IIIa Nominación · Tucumán",
};

const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const COLOR_TIPO: Record<TipoPrueba, string> = {
  Documental: "bg-slate-100 text-slate-700 ring-slate-200",
  Testimonial: "bg-sky-50 text-sky-700 ring-sky-200",
  Pericial: "bg-violet-50 text-violet-700 ring-violet-200",
  Informativa: "bg-teal-50 text-teal-700 ring-teal-200",
};

const COLOR_ESTADO: Record<Estado, string> = {
  Ofrecida: "bg-amber-50 text-amber-800 ring-amber-200",
  Producida: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Desistida: "bg-slate-100 text-slate-500 ring-slate-200",
};

const campo =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";
const botonPrimario =
  "shrink-0 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50";
const botonChico = "cursor-pointer rounded-md px-2.5 py-1 text-[15px] font-medium text-slate-500";

// --- Datos de ejemplo -----------------------------------------------------------------

const HECHOS_EJEMPLO: Hecho[] = [
  {
    id: 1,
    texto: "El colectivo interno 42 de la línea 7 pertenece a Transportes del Norte S.A. y lo conducía un dependiente de la empresa.",
    carga: "Actor",
  },
  { id: 2, texto: "El colectivo circulaba a una velocidad superior a la permitida.", carga: "Actor" },
  { id: 3, texto: "El colectivo no frenó ante el semáforo en rojo de Av. Mate de Luna y Av. Mitre.", carga: "Actor" },
  { id: 4, texto: "La actora cruzó la intersección con el semáforo en rojo.", carga: "Demandado" },
  { id: 5, texto: "Por el choque, la actora sufrió una incapacidad parcial y permanente del 18 %.", carga: "Actor" },
];

function pruebasEjemplo(v: Version): Prueba[] {
  return [
    { id: 1, descripcion: "Acta de procedimiento policial (Comisaría 3.ª)", tipo: "Documental", hechos: [1], estado: "Producida" },
    { id: 2, descripcion: "Informe de la Dirección de Transporte de la Provincia", tipo: "Informativa", hechos: [1], estado: "Ofrecida" },
    // En la V1 sólo puede acreditar un hecho; desde la V2, los dos que corresponde.
    { id: 3, descripcion: "Pericia mecánica (Ing. Ramiro Soria)", tipo: "Pericial", hechos: v >= 2 ? [2, 3] : [2], estado: "Producida" },
    { id: 4, descripcion: "Testimonio de Martín Gómez, testigo presencial", tipo: "Testimonial", hechos: [3], estado: "Ofrecida" },
    { id: 5, descripcion: "Testimonio de Carla Ruiz, pasajera del colectivo", tipo: "Testimonial", hechos: [4], estado: "Ofrecida" },
    { id: 6, descripcion: "Informe de la Municipalidad: cámaras de la intersección", tipo: "Informativa", hechos: [3], estado: "Desistida" },
  ];
}

function siguienteId(lista: { id: number }[]): number {
  return lista.reduce((max, x) => Math.max(max, x.id), 0) + 1;
}

function corto(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto;
}

// --- Componente ------------------------------------------------------------------------

export function MatrizPrueba({ v }: { v: Version }) {
  // Lo que suma cada versión (acumulativo).
  const muchosAMuchos = v >= 2;
  const marcarSinPrueba = v >= 3;
  const conEstados = v >= 4;

  const [hechos, setHechos] = useState<Hecho[]>(HECHOS_EJEMPLO);
  const [pruebas, setPruebas] = useState<Prueba[]>(() => pruebasEjemplo(v));
  const [nuevoHecho, setNuevoHecho] = useState("");
  const [nuevaCarga, setNuevaCarga] = useState<Carga>("Actor");
  const [nuevaPrueba, setNuevaPrueba] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<TipoPrueba>("Documental");
  const [edicion, setEdicion] = useState<Edicion | null>(null);

  /** V4: una prueba desistida no acredita nada. */
  const acredita = (p: Prueba) => !conEstados || p.estado !== "Desistida";
  const pruebasDe = (hechoId: number) => pruebas.filter((p) => p.hechos.includes(hechoId));
  const numero = (hechoId: number) => hechos.findIndex((h) => h.id === hechoId) + 1;
  const sinPrueba = (h: Hecho) => !pruebasDe(h.id).some(acredita);
  const hechosSinPrueba = hechos.filter(sinPrueba);

  // --- Hechos ---
  function agregarHecho(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texto = nuevoHecho.trim();
    if (!texto) return;
    setHechos((lista) => [...lista, { id: siguienteId(lista), texto, carga: nuevaCarga }]);
    setNuevoHecho("");
  }

  function eliminarHecho(id: number) {
    setHechos((lista) => lista.filter((h) => h.id !== id));
    setPruebas((lista) => lista.map((p) => ({ ...p, hechos: p.hechos.filter((x) => x !== id) })));
  }

  function cambiarCarga(id: number, carga: Carga) {
    setHechos((lista) => lista.map((h) => (h.id === id ? { ...h, carga } : h)));
  }

  // --- Pruebas ---
  function agregarPrueba(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const descripcion = nuevaPrueba.trim();
    if (!descripcion) return;
    setPruebas((lista) => [...lista, { id: siguienteId(lista), descripcion, tipo: nuevoTipo, hechos: [], estado: "Ofrecida" }]);
    setNuevaPrueba("");
  }

  function eliminarPrueba(id: number) {
    setPruebas((lista) => lista.filter((p) => p.id !== id));
  }

  /** V1: cada prueba acredita un solo hecho. */
  function vincularUnico(pruebaId: number, hechoId: number | null) {
    setPruebas((lista) => lista.map((p) => (p.id === pruebaId ? { ...p, hechos: hechoId === null ? [] : [hechoId] } : p)));
  }

  /** V2: muchos a muchos. */
  function alternarVinculo(pruebaId: number, hechoId: number) {
    setPruebas((lista) =>
      lista.map((p) => {
        if (p.id !== pruebaId) return p;
        const hechosP = p.hechos.includes(hechoId) ? p.hechos.filter((x) => x !== hechoId) : [...p.hechos, hechoId];
        return { ...p, hechos: hechosP };
      }),
    );
  }

  function cambiarEstado(id: number, estado: Estado) {
    setPruebas((lista) => lista.map((p) => (p.id === id ? { ...p, estado } : p)));
  }

  // --- Edición en línea ---
  function guardarEdicion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!edicion) return;
    const texto = edicion.texto.trim();
    if (!texto) return;
    if (edicion.clase === "hecho") {
      setHechos((lista) => lista.map((h) => (h.id === edicion.id ? { ...h, texto } : h)));
    } else {
      const { id, tipo } = edicion;
      setPruebas((lista) => lista.map((p) => (p.id === id ? { ...p, descripcion: texto, tipo } : p)));
    }
    setEdicion(null);
  }

  function restablecer() {
    setHechos(HECHOS_EJEMPLO);
    setPruebas(pruebasEjemplo(v));
    setEdicion(null);
    setNuevoHecho("");
    setNuevaPrueba("");
  }

  return (
    <div
      className="@container h-full w-full overflow-auto bg-white text-[17px] leading-relaxed text-slate-900 [color-scheme:light]"
      style={{ fontFamily: FUENTE }}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 @3xl:px-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 10h18M9 10v10" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 basis-48">
            <h1 className="text-xl font-bold tracking-tight @xl:text-2xl">Matriz de hechos y prueba</h1>
            <p className="truncate text-base text-slate-500">Vinculá cada hecho controvertido con la prueba que lo acredita.</p>
          </div>
          <button
            type="button"
            onClick={restablecer}
            className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[15px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Restablecer ejemplo
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6 @3xl:px-8 @3xl:py-8">
        <section className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Expediente</p>
          <p className="mt-0.5 text-lg font-semibold leading-snug">{EXPEDIENTE.caratula}</p>
          <p className="text-slate-600">
            {EXPEDIENTE.numero} · {EXPEDIENTE.juzgado}
          </p>
        </section>

        {(marcarSinPrueba || conEstados) && (
          <div className={`grid gap-4 ${conEstados ? "@4xl:grid-cols-2" : ""}`}>
            {marcarSinPrueba && (
              <AvisoSinPrueba sinPrueba={hechosSinPrueba} numero={numero} />
            )}
            {conEstados && <FaltaProducir hechos={hechos} pruebas={pruebas} numero={numero} />}
          </div>
        )}

        <div className="grid gap-6 @5xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] @5xl:items-start">
          {/* Columna de carga */}
          <div className="space-y-6">
            {/* Hechos */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Hechos controvertidos</h2>
              <form onSubmit={agregarHecho} className="mt-3 flex flex-wrap gap-2">
                <input
                  value={nuevoHecho}
                  onChange={(e) => setNuevoHecho(e.target.value)}
                  placeholder="Nuevo hecho controvertido…"
                  className={`${campo} min-w-0 flex-1 basis-56`}
                />
                {conEstados && (
                  <select
                    value={nuevaCarga}
                    onChange={(e) => setNuevaCarga(e.target.value as Carga)}
                    className={`${campo} w-auto`}
                    aria-label="Carga de la prueba"
                  >
                    {CARGAS.map((c) => (
                      <option key={c} value={c}>
                        Carga: {c}
                      </option>
                    ))}
                  </select>
                )}
                <button type="submit" disabled={!nuevoHecho.trim()} className={botonPrimario}>
                  Agregar
                </button>
              </form>

              <ol className="mt-4 space-y-3">
                {hechos.map((h, i) => {
                  const rojo = marcarSinPrueba && sinPrueba(h);
                  const editando = edicion?.clase === "hecho" && edicion.id === h.id ? edicion : null;
                  return (
                    <li
                      key={h.id}
                      className={`rounded-xl border p-4 ${rojo ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                            rojo ? "bg-red-600 text-white" : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          {editando ? (
                            <form onSubmit={guardarEdicion} className="space-y-2">
                              <textarea
                                rows={2}
                                value={editando.texto}
                                onChange={(e) => setEdicion({ ...editando, texto: e.target.value })}
                                className={campo}
                              />
                              <div className="flex gap-2">
                                <button type="submit" className={botonPrimario}>
                                  Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEdicion(null)}
                                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className={rojo ? "text-red-900" : ""}>{h.texto}</p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {rojo && (
                              <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-sm font-semibold text-white">Sin prueba</span>
                            )}
                            {conEstados && (
                              <label className="flex items-center gap-2 text-[15px] text-slate-600">
                                Carga de la prueba:
                                <select
                                  value={h.carga}
                                  onChange={(e) => cambiarCarga(h.id, e.target.value as Carga)}
                                  className="cursor-pointer rounded-md border border-slate-300 bg-white px-2 py-1 text-[15px] font-medium text-slate-800"
                                >
                                  {CARGAS.map((c) => (
                                    <option key={c}>{c}</option>
                                  ))}
                                </select>
                              </label>
                            )}
                            {!editando && (
                              <span className="ml-auto flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEdicion({ clase: "hecho", id: h.id, texto: h.texto })}
                                  className={`${botonChico} hover:bg-slate-100 hover:text-indigo-700`}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarHecho(h.id)}
                                  className={`${botonChico} hover:bg-red-50 hover:text-red-700`}
                                >
                                  Eliminar
                                </button>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Pruebas */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Elementos de prueba</h2>
              <form onSubmit={agregarPrueba} className="mt-3 flex flex-wrap gap-2">
                <input
                  value={nuevaPrueba}
                  onChange={(e) => setNuevaPrueba(e.target.value)}
                  placeholder="Nueva prueba…"
                  className={`${campo} min-w-0 flex-1 basis-56`}
                />
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as TipoPrueba)}
                  className={`${campo} w-auto`}
                  aria-label="Tipo de prueba"
                >
                  {TIPOS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button type="submit" disabled={!nuevaPrueba.trim()} className={botonPrimario}>
                  Agregar
                </button>
              </form>

              <ul className="mt-4 space-y-3">
                {pruebas.map((p) => {
                  const editando = edicion?.clase === "prueba" && edicion.id === p.id ? edicion : null;
                  return (
                    <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-4">
                      {editando ? (
                        <form onSubmit={guardarEdicion} className="space-y-2">
                          <input
                            value={editando.texto}
                            onChange={(e) => setEdicion({ ...editando, texto: e.target.value })}
                            className={campo}
                          />
                          <div className="flex flex-wrap gap-2">
                            <select
                              value={editando.tipo}
                              onChange={(e) => setEdicion({ ...editando, tipo: e.target.value as TipoPrueba })}
                              className={`${campo} w-auto`}
                            >
                              {TIPOS.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                            <button type="submit" className={botonPrimario}>
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setEdicion(null)}
                              className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex flex-wrap items-start gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ${COLOR_TIPO[p.tipo]}`}>{p.tipo}</span>
                          <p className={`min-w-0 flex-1 basis-48 font-medium ${conEstados && p.estado === "Desistida" ? "text-slate-400 line-through" : ""}`}>
                            {p.descripcion}
                          </p>
                        </div>
                      )}

                      {muchosAMuchos ? (
                        <div className="mt-3">
                          <p className="mb-1.5 text-[15px] text-slate-500">Acredita los hechos:</p>
                          <div className="flex flex-wrap gap-2">
                            {hechos.map((h, i) => {
                              const activo = p.hechos.includes(h.id);
                              return (
                                <button
                                  key={h.id}
                                  type="button"
                                  onClick={() => alternarVinculo(p.id, h.id)}
                                  aria-pressed={activo}
                                  title={h.texto}
                                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-[15px] font-semibold transition ${
                                    activo
                                      ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                                      : "border border-slate-300 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                                  }`}
                                >
                                  {activo ? "✓ " : ""}Hecho {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <label className="mt-3 block">
                          <span className="text-[15px] text-slate-500">Acredita el hecho…</span>
                          <select
                            value={p.hechos[0] ?? ""}
                            onChange={(e) => vincularUnico(p.id, e.target.value ? Number(e.target.value) : null)}
                            className={`${campo} mt-1 cursor-pointer`}
                          >
                            <option value="">— Sin vincular —</option>
                            {hechos.map((h, i) => (
                              <option key={h.id} value={h.id}>
                                Hecho {i + 1}: {corto(h.texto, 55)}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {conEstados && (
                          <label className="flex items-center gap-2 text-[15px] text-slate-600">
                            Estado:
                            <select
                              value={p.estado}
                              onChange={(e) => cambiarEstado(p.id, e.target.value as Estado)}
                              className={`cursor-pointer rounded-md px-2 py-1 text-[15px] font-semibold ring-1 ${COLOR_ESTADO[p.estado]}`}
                            >
                              {ESTADOS.map((s) => (
                                <option key={s}>{s}</option>
                              ))}
                            </select>
                          </label>
                        )}
                        {!editando && (
                          <span className="ml-auto flex gap-1">
                            <button
                              type="button"
                              onClick={() => setEdicion({ clase: "prueba", id: p.id, texto: p.descripcion, tipo: p.tipo })}
                              className={`${botonChico} hover:bg-slate-100 hover:text-indigo-700`}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => eliminarPrueba(p.id)}
                              className={`${botonChico} hover:bg-red-50 hover:text-red-700`}
                            >
                              Eliminar
                            </button>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          {/* Tabla hecho → pruebas */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm @5xl:sticky @5xl:top-28">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
              <h2 className="text-xl font-semibold">Hecho → prueba</h2>
              <p className="text-[15px] text-slate-500">Qué prueba acredita cada hecho controvertido.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm uppercase tracking-wide text-slate-500">
                    <th className="w-10 px-4 py-2.5 font-semibold">#</th>
                    <th className="w-[42%] px-2 py-2.5 font-semibold">Hecho controvertido</th>
                    <th className="px-4 py-2.5 font-semibold">Pruebas</th>
                  </tr>
                </thead>
                <tbody>
                  {hechos.map((h, i) => {
                    const vinculadas = pruebasDe(h.id);
                    const rojo = marcarSinPrueba && sinPrueba(h);
                    return (
                      <tr key={h.id} className={`border-b border-slate-100 align-top last:border-0 ${rojo ? "bg-red-50" : ""}`}>
                        <td className={`px-4 py-3 font-bold ${rojo ? "text-red-700" : "text-indigo-700"}`}>{i + 1}</td>
                        <td className="px-2 py-3">
                          <p className={`leading-snug ${rojo ? "font-medium text-red-900" : ""}`}>{h.texto}</p>
                          {conEstados && (
                            <span
                              className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ring-1 ${
                                h.carga === "Actor" ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-orange-50 text-orange-700 ring-orange-200"
                              }`}
                            >
                              Carga: {h.carga}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {vinculadas.length === 0 ? (
                            rojo ? (
                              <span className="font-semibold text-red-700">Sin prueba</span>
                            ) : (
                              <span className="text-slate-400">— Sin pruebas vinculadas</span>
                            )
                          ) : (
                            <ul className="space-y-2">
                              {vinculadas.map((p) => {
                                const desistida = conEstados && p.estado === "Desistida";
                                return (
                                  <li key={p.id} className="leading-snug">
                                    <span className={desistida ? "text-slate-400 line-through" : "font-medium"}>{p.descripcion}</span>{" "}
                                    <span className={`whitespace-nowrap rounded-full px-2 py-px align-[1px] text-[13px] font-medium ring-1 ${COLOR_TIPO[p.tipo]}`}>
                                      {p.tipo}
                                    </span>
                                    {conEstados && (
                                      <>
                                        {" "}
                                        <span
                                          className={`whitespace-nowrap rounded-full px-2 py-px align-[1px] text-[13px] font-medium ring-1 ${COLOR_ESTADO[p.estado]}`}
                                        >
                                          {p.estado}
                                        </span>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                              {rojo && <li className="font-semibold text-red-700">Sin prueba vigente</li>}
                            </ul>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function AvisoSinPrueba({ sinPrueba, numero }: { sinPrueba: Hecho[]; numero: (id: number) => number }) {
  if (sinPrueba.length === 0) {
    return (
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
        <p className="text-lg font-semibold">✓ Todos los hechos controvertidos tienen al menos una prueba.</p>
      </section>
    );
  }
  return (
    <section className="rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-red-800">
      <p className="text-xl font-bold">
        ⚠ {sinPrueba.length} {sinPrueba.length === 1 ? "hecho controvertido sin prueba" : "hechos controvertidos sin prueba"}
      </p>
      <ul className="mt-2 space-y-1">
        {sinPrueba.map((h) => (
          <li key={h.id}>
            <strong>Hecho {numero(h.id)}:</strong> {h.texto}
          </li>
        ))}
      </ul>
    </section>
  );
}

function FaltaProducir({ hechos, pruebas, numero }: { hechos: Hecho[]; pruebas: Prueba[]; numero: (id: number) => number }) {
  const cargaDe = (id: number) => hechos.find((h) => h.id === id)?.carga;
  const ofrecidas = pruebas.filter((p) => p.estado === "Ofrecida");
  const cuenta = (e: Estado) => pruebas.filter((p) => p.estado === e).length;

  const grupos = [
    ...CARGAS.map((carga) => ({
      titulo: carga === "Actor" ? "Carga del actor" : "Carga del demandado",
      items: ofrecidas
        .map((p) => ({ p, hechos: p.hechos.filter((id) => cargaDe(id) === carga) }))
        .filter((x) => x.hechos.length > 0),
    })),
    { titulo: "Sin hecho vinculado", items: ofrecidas.filter((p) => p.hechos.length === 0).map((p) => ({ p, hechos: [] as number[] })) },
  ].filter((g) => g.titulo !== "Sin hecho vinculado" || g.items.length > 0);

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold">Falta producir</h2>
        <p className="text-[15px] text-slate-500">
          Producidas {cuenta("Producida")} · Ofrecidas {cuenta("Ofrecida")} · Desistidas {cuenta("Desistida")}
        </p>
      </div>
      {ofrecidas.length === 0 ? (
        <p className="mt-2 text-emerald-700">Nada pendiente: toda la prueba ofrecida está producida.</p>
      ) : (
        <div className="mt-2 space-y-3">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {g.titulo} ({g.items.length})
              </p>
              {g.items.length === 0 ? (
                <p className="text-slate-400">Nada pendiente.</p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {g.items.map(({ p, hechos: ids }) => (
                    <li key={p.id} className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium">{p.descripcion}</span>
                      {ids.length > 0 && (
                        <span className="text-[15px] text-slate-500">→ {ids.map((id) => `Hecho ${numero(id)}`).join(", ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
