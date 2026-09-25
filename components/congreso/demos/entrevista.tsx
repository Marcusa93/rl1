"use client";

// Caso C de la demo · "Guía de primera entrevista".
// La versión "ensayada" de lo que produce cada instrucción (lib/congreso.ts,
// CONG_CASOS). Cada versión suma lo de la anterior:
//   V1  primera versión. Asistente paso a paso con una lista FIJA de preguntas
//       (mezcla preguntas de accidente: "¿Hubo lesionados?", "¿El vehículo tenía
//       seguro?") para cualquier caso, sin "no sé", y al final la ficha del caso.
//   V2  primero "¿Qué tipo de asunto es?" y preguntas según el tipo (laboral,
//       familia, accidente de tránsito, consumidor) + botón "No sé".
//   V3  alerta de plazo urgente al principio de la ficha si recibió una
//       notificación / carta documento / intimación / telegrama, o si los hechos
//       pasaron hace más de un año.
//   V4  documentación que tiene que traer (según el tipo) + botón "Copiar ficha".

import { useState, useSyncExternalStore, type FormEvent } from "react";

type Version = 1 | 2 | 3 | 4;
type TipoAsunto = "laboral" | "familia" | "transito" | "consumidor";
type Campo = "texto" | "largo" | "fecha" | "opciones";
type Respuestas = Record<string, string>;

interface Pregunta {
  id: string;
  texto: string;
  /** Cómo aparece en la ficha. */
  etiqueta: string;
  campo: Campo;
  opciones?: string[];
  placeholder?: string;
  /** V2: no ofrece "No sé" (el tipo de asunto y el nombre). */
  sinNoSe?: boolean;
  /** V3: si la respuesta es "Sí", motivo de la alerta. */
  alertaSi?: string;
  /** V3: fecha de los hechos (más de un año → alerta). */
  alertaFecha?: boolean;
}

const NO_SE = "No sé";
const SI_NO = ["Sí", "No"];
const FUENTE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// --- V1: la misma lista para cualquier caso -----------------------------------------------

const PREGUNTAS_V1: Pregunta[] = [
  { id: "nombre", texto: "¿Cómo se llama el cliente?", etiqueta: "Cliente", campo: "texto", placeholder: "Nombre y apellido" },
  { id: "telefono", texto: "¿Cuál es su teléfono de contacto?", etiqueta: "Teléfono", campo: "texto" },
  { id: "relato", texto: "¿Qué pasó? Contá brevemente los hechos.", etiqueta: "Relato", campo: "largo" },
  { id: "fecha", texto: "¿Cuándo ocurrieron los hechos?", etiqueta: "Fecha de los hechos", campo: "fecha" },
  { id: "lugar", texto: "¿Dónde ocurrieron?", etiqueta: "Lugar", campo: "texto" },
  { id: "lesionados", texto: "¿Hubo lesionados?", etiqueta: "Lesionados", campo: "opciones", opciones: SI_NO },
  { id: "seguro", texto: "¿El vehículo tenía seguro?", etiqueta: "Seguro del vehículo", campo: "opciones", opciones: SI_NO },
  { id: "denuncia", texto: "¿Se hizo la denuncia policial?", etiqueta: "Denuncia policial", campo: "opciones", opciones: SI_NO },
  { id: "objetivo", texto: "¿Qué espera lograr el cliente?", etiqueta: "Objetivo del cliente", campo: "largo" },
];

// --- V2: primero el tipo de asunto, después sus preguntas ----------------------------------

const TIPOS: { id: TipoAsunto; nombre: string; detalle: string }[] = [
  { id: "laboral", nombre: "Laboral", detalle: "Despidos, deudas salariales, trabajo no registrado" },
  { id: "familia", nombre: "Familia", detalle: "Divorcio, alimentos, cuidado de los hijos, bienes" },
  { id: "transito", nombre: "Accidente de tránsito", detalle: "Choques, lesiones, daños al vehículo" },
  { id: "consumidor", nombre: "Consumidor", detalle: "Compras, servicios, bancos, garantías" },
];

const PREGUNTA_TIPO: Pregunta = {
  id: "tipo",
  texto: "¿Qué tipo de asunto es?",
  etiqueta: "Tipo de asunto",
  campo: "opciones",
  opciones: TIPOS.map((t) => t.id),
  sinNoSe: true,
};

const COMUNES: Pregunta[] = [
  { ...PREGUNTAS_V1[0], sinNoSe: true },
  PREGUNTAS_V1[1],
];

const POR_TIPO: Record<TipoAsunto, Pregunta[]> = {
  laboral: [
    { id: "lab_relato", texto: "¿Qué pasó? Contá brevemente los hechos.", etiqueta: "Relato", campo: "largo" },
    { id: "lab_ingreso", texto: "¿Cuándo empezó a trabajar?", etiqueta: "Fecha de ingreso", campo: "fecha" },
    {
      id: "lab_categoria",
      texto: "¿Qué categoría tenía y qué convenio colectivo le correspondía?",
      etiqueta: "Categoría y convenio",
      campo: "texto",
      placeholder: "Ej.: vendedor B, CCT 130/75",
    },
    {
      id: "lab_registro",
      texto: "¿Estaba registrado?",
      etiqueta: "Registración",
      campo: "opciones",
      opciones: ["Sí, correctamente", "Parcialmente (parte del sueldo en negro)", "No"],
    },
    {
      id: "lab_extincion",
      texto: "¿Cómo terminó la relación laboral?",
      etiqueta: "Forma de extinción",
      campo: "opciones",
      opciones: ["Despido sin causa", "Despido con causa", "Renuncia", "Se consideró despedido", "Sigue trabajando"],
    },
    { id: "lab_fecha", texto: "¿Cuándo terminó la relación laboral?", etiqueta: "Fecha de egreso", campo: "fecha", alertaFecha: true },
    {
      id: "lab_telegrama",
      texto: "¿Recibió un telegrama o una carta documento?",
      etiqueta: "Telegrama o carta documento",
      campo: "opciones",
      opciones: SI_NO,
      alertaSi: "Recibió un telegrama o una carta documento.",
    },
    { id: "lab_sueldo", texto: "¿Cuál era su última remuneración mensual?", etiqueta: "Última remuneración", campo: "texto" },
  ],
  familia: [
    { id: "fam_relato", texto: "¿Qué pasó? Contá brevemente la situación.", etiqueta: "Relato", campo: "largo" },
    {
      id: "fam_vinculo",
      texto: "¿Qué vínculo tiene con la otra parte?",
      etiqueta: "Vínculo",
      campo: "opciones",
      opciones: ["Matrimonio", "Unión convivencial", "Ex pareja (sin convivencia)", "Otro"],
    },
    { id: "fam_separacion", texto: "¿Desde cuándo están separados?", etiqueta: "Fecha de separación", campo: "fecha", alertaFecha: true },
    { id: "fam_hijos", texto: "¿Hay hijos menores de edad?", etiqueta: "Hijos menores", campo: "opciones", opciones: SI_NO },
    { id: "fam_hijos_detalle", texto: "¿Cuántos hijos y de qué edades?", etiqueta: "Hijos (cantidad y edades)", campo: "texto" },
    {
      id: "fam_alimentos",
      texto: "¿Hay una cuota alimentaria?",
      etiqueta: "Alimentos",
      campo: "opciones",
      opciones: ["No hay acuerdo ni cuota", "Hay un acuerdo informal", "Hay una cuota fijada judicialmente"],
    },
    { id: "fam_bienes", texto: "¿Hay bienes en común? (casa, auto, otros)", etiqueta: "Bienes", campo: "largo" },
    {
      id: "fam_notificacion",
      texto: "¿Recibió alguna notificación o intimación?",
      etiqueta: "Notificación o intimación",
      campo: "opciones",
      opciones: SI_NO,
      alertaSi: "Recibió una notificación o una intimación.",
    },
  ],
  transito: [
    { id: "tra_relato", texto: "¿Qué pasó? Contá brevemente cómo fue el accidente.", etiqueta: "Relato", campo: "largo" },
    { id: "tra_fecha", texto: "¿Cuándo ocurrió el accidente?", etiqueta: "Fecha del accidente", campo: "fecha", alertaFecha: true },
    { id: "tra_lugar", texto: "¿Dónde ocurrió?", etiqueta: "Lugar", campo: "texto" },
    { id: "tra_vehiculos", texto: "¿Qué vehículos participaron?", etiqueta: "Vehículos", campo: "texto" },
    { id: "tra_lesionados", texto: "¿Hubo lesionados?", etiqueta: "Lesionados", campo: "opciones", opciones: SI_NO },
    { id: "tra_seguro", texto: "¿Los vehículos tenían seguro? ¿De qué compañía?", etiqueta: "Seguros", campo: "texto" },
    { id: "tra_denuncia", texto: "¿Se hizo la denuncia policial?", etiqueta: "Denuncia policial", campo: "opciones", opciones: SI_NO },
    {
      id: "tra_notificacion",
      texto: "¿Recibió alguna notificación, carta documento o intimación?",
      etiqueta: "Notificación o carta documento",
      campo: "opciones",
      opciones: SI_NO,
      alertaSi: "Recibió una notificación, carta documento o intimación.",
    },
  ],
  consumidor: [
    { id: "con_relato", texto: "¿Qué pasó? Contá brevemente el problema.", etiqueta: "Relato", campo: "largo" },
    { id: "con_proveedor", texto: "¿Contra qué empresa o proveedor es el reclamo?", etiqueta: "Proveedor", campo: "texto" },
    { id: "con_producto", texto: "¿Qué producto o servicio contrató?", etiqueta: "Producto o servicio", campo: "texto" },
    { id: "con_fecha", texto: "¿Cuándo ocurrió el problema?", etiqueta: "Fecha del problema", campo: "fecha", alertaFecha: true },
    {
      id: "con_reclamo",
      texto: "¿Hizo un reclamo previo?",
      etiqueta: "Reclamo previo",
      campo: "opciones",
      opciones: ["Sí, a la empresa", "Sí, ante Defensa del Consumidor", "No"],
    },
    { id: "con_monto", texto: "¿Cuál es el monto involucrado?", etiqueta: "Monto", campo: "texto" },
    {
      id: "con_notificacion",
      texto: "¿Recibió alguna notificación, carta documento o intimación?",
      etiqueta: "Notificación o carta documento",
      campo: "opciones",
      opciones: SI_NO,
      alertaSi: "Recibió una notificación, carta documento o intimación.",
    },
  ],
};

// --- V4: documentación según el tipo de caso -------------------------------------------------

const DOCUMENTOS: Record<TipoAsunto, string[]> = {
  laboral: [
    "DNI",
    "Recibos de sueldo (los últimos que tenga)",
    "Telegramas y cartas documento, enviados y recibidos",
    "Certificado de trabajo, si se lo entregaron",
    "Constancia de CUIL e historia laboral (Mi ANSES)",
    "Chats, mails o mensajes con el empleador",
    "Nombres y contacto de compañeros que puedan declarar",
  ],
  familia: [
    "DNI",
    "Acta de matrimonio o constancia de la unión convivencial",
    "Partidas de nacimiento de los hijos",
    "Comprobantes de gastos de los hijos (escuela, salud, actividades)",
    "Datos del trabajo o de los ingresos de la otra parte, si los conoce",
    "Escrituras, títulos o papeles de los bienes (casa, auto)",
    "Notificaciones o intimaciones recibidas",
  ],
  transito: [
    "DNI y licencia de conducir",
    "Cédula del vehículo y póliza del seguro",
    "Denuncia policial o exposición",
    "Certificados médicos e historia clínica",
    "Fotos del lugar, de los vehículos y de las lesiones",
    "Presupuestos o facturas de reparación",
    "Datos de los testigos y del otro conductor",
  ],
  consumidor: [
    "DNI",
    "Factura o comprobante de compra",
    "Contrato, términos y condiciones o garantía",
    "Constancias de los reclamos (números de gestión, mails, chats)",
    "Publicidad u oferta (capturas de pantalla)",
    "Resúmenes de tarjeta o comprobantes de pago",
    "Notificaciones o cartas documento recibidas",
  ],
};

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

function restarDias(iso: string, dias: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d - dias));
  return f.toISOString().slice(0, 10);
}

function formatear(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function mesesEntre(desde: string, hasta: string): number {
  const [a1, m1, d1] = desde.split("-").map(Number);
  const [a2, m2, d2] = hasta.split("-").map(Number);
  return (a2 - a1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
}

function unAnioAntes(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${Number(a) - 1}-${m}-${d}`;
}

// --- Cliente de ejemplo (para recorrer rápido) ----------------------------------------------

function ejemplo(hoy: string): Respuestas {
  const hace = (dias: number) => restarDias(hoy, dias);
  const relatoDespido =
    "Trabajaba como vendedor en una distribuidora. Hace unas semanas le dijeron que no volviera más y no le pagaron la liquidación final.";
  return {
    nombre: "Jorge Ledesma",
    telefono: "381 555-0142",
    // V1
    relato: relatoDespido,
    fecha: hace(24),
    lugar: "En la distribuidora, en San Miguel de Tucumán",
    objetivo: "Cobrar la indemnización por despido.",
    // Laboral
    lab_relato: relatoDespido,
    lab_ingreso: "2019-03-01",
    lab_categoria: "Vendedor B, empleado de comercio (CCT 130/75)",
    lab_registro: "Parcialmente (parte del sueldo en negro)",
    lab_extincion: "Despido sin causa",
    lab_fecha: hace(24),
    lab_telegrama: "No",
    lab_sueldo: "$ 1.150.000",
    // Familia
    fam_relato: "Se separó de su esposa. Los dos hijos viven con él y la madre no aporta para sus gastos.",
    fam_vinculo: "Matrimonio",
    fam_separacion: hace(120),
    fam_hijos: "Sí",
    fam_hijos_detalle: "Dos: 8 y 12 años",
    fam_alimentos: "No hay acuerdo ni cuota",
    fam_bienes: "Una casa en Yerba Buena y un auto.",
    fam_notificacion: "No",
    // Tránsito
    tra_relato: "Un colectivo lo chocó cuando cruzaba la avenida en moto. Lo atendieron en la guardia.",
    tra_fecha: hace(40),
    tra_lugar: "Av. Mate de Luna y Av. Mitre, San Miguel de Tucumán",
    tra_vehiculos: "Su moto y un colectivo de la línea 7",
    tra_lesionados: "Sí",
    tra_seguro: "La moto sí; del colectivo no sabe",
    tra_denuncia: "Sí",
    tra_notificacion: "No",
    // Consumidor
    con_relato: "Compró una heladera que dejó de funcionar a los dos meses. El service no la repara y la tienda no le contesta.",
    con_proveedor: "Electro Norte S.A.",
    con_producto: "Heladera con freezer, comprada en 12 cuotas",
    con_fecha: hace(60),
    con_reclamo: "Sí, a la empresa",
    con_monto: "$ 1.400.000",
    con_notificacion: "No",
  };
}

function esTipo(valor: string | undefined): valor is TipoAsunto {
  return TIPOS.some((t) => t.id === valor);
}

function nombreTipo(id: TipoAsunto): string {
  return TIPOS.find((t) => t.id === id)?.nombre ?? id;
}

function valorLegible(p: Pregunta, valor: string): string {
  if (!valor) return "Sin respuesta";
  if (valor === NO_SE) return "No sabe";
  if (p.campo === "fecha") return formatear(valor);
  return valor;
}

/** V3: por qué la ficha abre con una alerta de plazo. */
function motivosDeUrgencia(preguntas: Pregunta[], r: Respuestas, hoy: string): string[] {
  const motivos: string[] = [];
  for (const p of preguntas) {
    const valor = r[p.id];
    if (!valor || valor === NO_SE) continue;
    if (p.alertaSi && valor === "Sí") motivos.push(p.alertaSi);
    if (p.alertaFecha && valor < unAnioAntes(hoy)) {
      motivos.push(`${p.etiqueta}: ${formatear(valor)}, hace ${mesesEntre(valor, hoy)} meses (más de un año).`);
    }
  }
  return motivos;
}

/** V4: la ficha en texto plano, para pegar donde haga falta. */
function fichaEnTexto(o: {
  nombre: string;
  hoy: string;
  tipo: TipoAsunto | null;
  preguntas: Pregunta[];
  respuestas: Respuestas;
  motivos: string[];
  noSabe: Pregunta[];
  documentos: string[];
  traidos: string[];
}): string {
  const lineas: string[] = [`FICHA DEL CASO — ${o.nombre || "Cliente sin nombre"}`, `Primera entrevista: ${formatear(o.hoy)}`];
  if (o.tipo) lineas.push(`Tipo de asunto: ${nombreTipo(o.tipo)}`);
  if (o.motivos.length) {
    lineas.push("", "⚠ PLAZO URGENTE");
    for (const m of o.motivos) lineas.push(`- ${m}`);
    lineas.push("Verificar los plazos de caducidad y prescripción aplicables.");
  }
  lineas.push("", "DATOS");
  for (const p of o.preguntas) lineas.push(`- ${p.etiqueta}: ${valorLegible(p, o.respuestas[p.id] ?? "")}`);
  if (o.noSabe.length) {
    lineas.push("", "PARA AVERIGUAR");
    for (const p of o.noSabe) lineas.push(`- ${p.etiqueta}`);
  }
  if (o.documentos.length) {
    lineas.push("", "DOCUMENTACIÓN QUE TIENE QUE TRAER");
    for (const d of o.documentos) lineas.push(`[${o.traidos.includes(d) ? "x" : " "}] ${d}`);
  }
  return lineas.join("\n");
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

// --- Componente ------------------------------------------------------------------------

export function Entrevista({ v }: { v: Version }) {
  // Lo que suma cada versión (acumulativo).
  const porTipo = v >= 2;
  const conAlerta = v >= 3;
  const conDocumentos = v >= 4;

  const hoy = useHoy();
  const [respuestas, setRespuestas] = useState<Respuestas>(() => ejemplo(hoyLocal()));
  const [paso, setPaso] = useState(0);
  const [verFicha, setVerFicha] = useState(false);
  const [traidos, setTraidos] = useState<string[]>([]);
  const [copiado, setCopiado] = useState<"" | "ok" | "error">("");

  const tipo = esTipo(respuestas.tipo) ? respuestas.tipo : null;
  const preguntas: Pregunta[] = porTipo ? [PREGUNTA_TIPO, ...COMUNES, ...(tipo ? POR_TIPO[tipo] : [])] : PREGUNTAS_V1;
  const actual = preguntas[Math.min(paso, preguntas.length - 1)];
  const valor = respuestas[actual.id] ?? "";
  const respondida = valor.trim() !== "";
  const ultima = paso >= preguntas.length - 1 && (!porTipo || tipo !== null);
  const total = porTipo && !tipo ? null : preguntas.length;
  const yaDioNombre = preguntas.findIndex((p) => p.id === "nombre") < paso;

  function responder(id: string, texto: string) {
    setRespuestas((r) => ({ ...r, [id]: texto }));
  }

  function siguiente(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!respondida) return;
    if (ultima) setVerFicha(true);
    else setPaso((p) => p + 1);
  }

  function reiniciar(conEjemplo: boolean) {
    setRespuestas(conEjemplo ? ejemplo(hoyLocal()) : {});
    setPaso(0);
    setVerFicha(false);
    setTraidos([]);
    setCopiado("");
  }

  return (
    <div
      className="@container h-full w-full overflow-auto bg-white text-[17px] leading-relaxed text-slate-900 [color-scheme:light]"
      style={{ fontFamily: FUENTE }}
    >
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 @3xl:px-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M4 5h16v11H9l-5 4V5z" strokeLinejoin="round" />
              <path d="M8 9h8M8 12h5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1 basis-48">
            <h1 className="text-xl font-bold tracking-tight @xl:text-2xl">Guía de primera entrevista</h1>
            <p className="truncate text-base text-slate-500">Preguntas paso a paso y, al final, la ficha del caso.</p>
          </div>
          <button
            type="button"
            onClick={() => reiniciar(true)}
            className="shrink-0 cursor-pointer rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-[15px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Restablecer ejemplo
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-6 @3xl:px-8 @3xl:py-10">
        {verFicha ? (
          <Ficha
            hoy={hoy ?? hoyLocal()}
            porTipo={porTipo}
            conAlerta={conAlerta}
            conDocumentos={conDocumentos}
            tipo={tipo}
            preguntas={preguntas}
            respuestas={respuestas}
            traidos={traidos}
            copiado={copiado}
            onTraido={(doc) => setTraidos((l) => (l.includes(doc) ? l.filter((x) => x !== doc) : [...l, doc]))}
            onCopiar={async (texto) => {
              const ok = await copiarTexto(texto);
              setCopiado(ok ? "ok" : "error");
              setTimeout(() => setCopiado(""), 2000);
            }}
            onVolver={() => {
              setVerFicha(false);
              setPaso(preguntas.length - 1);
            }}
            onNueva={() => reiniciar(false)}
          />
        ) : (
          <form onSubmit={siguiente} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm @2xl:p-8">
            <div className="flex items-center justify-between text-[15px] text-slate-500">
              <span>
                Pregunta {paso + 1} de {total ?? "…"}
              </span>
              {yaDioNombre && respuestas.nombre && <span className="truncate pl-4">Cliente: {respuestas.nombre}</span>}
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${total ? Math.round(((paso + 1) / total) * 100) : 8}%` }}
              />
            </div>

            <h2 className="mt-7 text-2xl font-semibold leading-snug @2xl:text-[28px]">{actual.texto}</h2>

            <div className="mt-5">
              {valor === NO_SE ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="font-semibold text-amber-800">No sabe.</span>
                  <span className="text-amber-800">Queda anotado para averiguar.</span>
                  <button
                    type="button"
                    onClick={() => responder(actual.id, "")}
                    className="ml-auto cursor-pointer rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-[15px] font-medium text-amber-800 hover:bg-amber-100"
                  >
                    Responder
                  </button>
                </div>
              ) : (
                <CampoRespuesta p={actual} valor={valor} hoy={hoy} onCambio={(x) => responder(actual.id, x)} />
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPaso((p) => Math.max(0, p - 1))}
                disabled={paso === 0}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              <div className="flex gap-3">
                {porTipo && !actual.sinNoSe && valor !== NO_SE && (
                  <button
                    type="button"
                    onClick={() => responder(actual.id, NO_SE)}
                    className="cursor-pointer rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 font-semibold text-amber-800 hover:bg-amber-100"
                  >
                    No sé
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!respondida}
                  className="cursor-pointer rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ultima ? "Ver ficha" : "Siguiente →"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function CampoRespuesta({
  p,
  valor,
  hoy,
  onCambio,
}: {
  p: Pregunta;
  valor: string;
  hoy: string | null;
  onCambio: (valor: string) => void;
}) {
  const campo =
    "block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

  if (p.id === "tipo") {
    return (
      <div className="grid gap-3 @xl:grid-cols-2">
        {TIPOS.map((t) => {
          const activo = valor === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onCambio(t.id)}
              aria-pressed={activo}
              className={`cursor-pointer rounded-xl border-2 p-4 text-left transition ${
                activo ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              <span className={`block text-lg font-semibold ${activo ? "text-indigo-700" : ""}`}>{t.nombre}</span>
              <span className="block text-[15px] text-slate-500">{t.detalle}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (p.campo === "opciones" && p.opciones) {
    return (
      <div className={`grid gap-3 ${p.opciones.length > 2 ? "@xl:grid-cols-2" : "grid-cols-2"}`}>
        {p.opciones.map((o) => {
          const activo = valor === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onCambio(o)}
              aria-pressed={activo}
              className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-left text-lg font-medium transition ${
                activo ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white hover:border-indigo-300"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  }

  if (p.campo === "largo") {
    return <textarea rows={4} value={valor} onChange={(e) => onCambio(e.target.value)} placeholder={p.placeholder} className={`${campo} resize-y`} />;
  }

  if (p.campo === "fecha") {
    return (
      <input type="date" value={valor} max={hoy ?? undefined} onChange={(e) => onCambio(e.target.value)} className={`${campo} max-w-xs`} />
    );
  }

  return <input value={valor} onChange={(e) => onCambio(e.target.value)} placeholder={p.placeholder} className={campo} />;
}

function Ficha({
  hoy,
  porTipo,
  conAlerta,
  conDocumentos,
  tipo,
  preguntas,
  respuestas,
  traidos,
  copiado,
  onTraido,
  onCopiar,
  onVolver,
  onNueva,
}: {
  hoy: string;
  porTipo: boolean;
  conAlerta: boolean;
  conDocumentos: boolean;
  tipo: TipoAsunto | null;
  preguntas: Pregunta[];
  respuestas: Respuestas;
  traidos: string[];
  copiado: "" | "ok" | "error";
  onTraido: (doc: string) => void;
  onCopiar: (texto: string) => void;
  onVolver: () => void;
  onNueva: () => void;
}) {
  const nombre = respuestas.nombre ?? "";
  const datos = preguntas.filter((p) => p.id !== "tipo" && p.id !== "nombre");
  const noSabe = porTipo ? datos.filter((p) => respuestas[p.id] === NO_SE) : [];
  const motivos = conAlerta ? motivosDeUrgencia(preguntas, respuestas, hoy) : [];
  const documentos = conDocumentos && tipo ? DOCUMENTOS[tipo] : [];

  const texto = fichaEnTexto({ nombre, hoy, tipo, preguntas: datos, respuestas, motivos, noSabe, documentos, traidos });

  return (
    <div className="space-y-5">
      {motivos.length > 0 && (
        <section className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-red-900 shadow-sm">
          <p className="text-2xl font-bold text-red-700">⚠ Plazo urgente</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {motivos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 font-semibold">Verificar los plazos de caducidad y prescripción aplicables antes de cualquier otra gestión.</p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm @2xl:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Ficha del caso</p>
            <h2 className="text-2xl font-bold @2xl:text-3xl">{nombre || "Cliente sin nombre"}</h2>
            <p className="text-slate-500">
              Primera entrevista · {formatear(hoy)}
              {tipo && ` · ${nombreTipo(tipo)}`}
            </p>
          </div>
          {conDocumentos && (
            <button
              type="button"
              onClick={() => onCopiar(texto)}
              className={`shrink-0 cursor-pointer rounded-lg px-4 py-2.5 font-semibold shadow-sm transition ${
                copiado === "ok" ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {copiado === "ok" ? "✓ ¡Copiada!" : copiado === "error" ? "No se pudo copiar" : "Copiar ficha"}
            </button>
          )}
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 @2xl:grid-cols-2">
          {datos.map((p) => {
            const valor = respuestas[p.id] ?? "";
            return (
              <div key={p.id} className={p.campo === "largo" ? "@2xl:col-span-2" : ""}>
                <dt className="text-[15px] text-slate-500">{p.etiqueta}</dt>
                <dd className="font-medium">
                  {valor === NO_SE ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[15px] font-semibold text-amber-800 ring-1 ring-amber-200">
                      No sabe
                    </span>
                  ) : (
                    <span className={valor ? "" : "text-slate-400"}>{valorLegible(p, valor)}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      {noSabe.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-lg font-semibold text-amber-900">Para averiguar ({noSabe.length})</h3>
          <p className="text-[15px] text-amber-800">El cliente no supo responder:</p>
          <ul className="mt-2 list-disc space-y-0.5 pl-6 text-amber-900">
            {noSabe.map((p) => (
              <li key={p.id}>{p.etiqueta}</li>
            ))}
          </ul>
        </section>
      )}

      {documentos.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl font-semibold">Documentación que tiene que traer</h3>
            <span className="text-[15px] text-slate-500">
              {traidos.filter((d) => documentos.includes(d)).length} de {documentos.length}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {documentos.map((d) => (
              <li key={d}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={traidos.includes(d)}
                    onChange={() => onTraido(d)}
                    className="mt-1 h-5 w-5 shrink-0 accent-indigo-600"
                  />
                  <span className={traidos.includes(d) ? "text-slate-400 line-through" : ""}>{d}</span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onCopiar(texto)}
            className="mt-5 cursor-pointer rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5 font-semibold text-indigo-700 hover:bg-indigo-100"
          >
            {copiado === "ok" ? "✓ ¡Copiada!" : "Copiar ficha"}
          </button>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Volver a las preguntas
        </button>
        <button
          type="button"
          onClick={onNueva}
          className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Nueva entrevista
        </button>
      </div>
    </div>
  );
}
