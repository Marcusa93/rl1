"use client";

// "Capturas" ilustrativas para la masterclass: recreaciones de la interfaz
// de un proyecto, una skill, una tarea programada y la memoria, con datos
// ficticios. Sirven de respaldo si no se puede mostrar la herramienta en
// vivo: no dependen de internet ni exponen cuentas reales. Las marcas ①②③
// de la ventana se explican en la leyenda de al lado.

import { cn } from "@/lib/utils";

export type CapturaId = "proyecto" | "skill" | "tarea" | "memoria";

export function Captura({ id }: { id: CapturaId }) {
  const C = { proyecto: CapturaProyecto, skill: CapturaSkill, tarea: CapturaTarea, memoria: CapturaMemoria }[id];
  return <C />;
}

// --- Piezas comunes ------------------------------------------------------------

function Ventana({ app, ruta, children }: { app: string; ruta: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white text-zinc-800 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-center font-mono text-[11px] text-zinc-500">{ruta}</div>
        <span className="shrink-0 text-[11px] font-semibold text-zinc-500">{app}</span>
      </div>
      {children}
    </div>
  );
}

/** Marca numerada sobre la captura (se explica en la leyenda). */
function Marca({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "pulse-ring inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-teal font-mono text-xs font-bold text-ink",
        className,
      )}
    >
      {n}
    </span>
  );
}

export function Leyenda({ items }: { items: { titulo: string; texto: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => (
        <div key={it.titulo} className="rise flex gap-3" style={{ animationDelay: `${0.4 + i * 0.12}s` }}>
          <Marca n={i + 1} />
          <div>
            <p className="font-semibold leading-snug">{it.titulo}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted">{it.texto}</p>
          </div>
        </div>
      ))}
      <p className="mt-2 text-xs text-faint">Recreación ilustrativa · datos ficticios · la interfaz real puede variar.</p>
    </div>
  );
}

export const LEYENDAS: Record<CapturaId, { titulo: string; texto: string }[]> = {
  proyecto: [
    { titulo: "Instrucciones del proyecto", texto: "Funcionan como prompt de sistema: valen para todas las conversaciones del proyecto." },
    { titulo: "Archivos del proyecto", texto: "El contexto que no hay que volver a cargar: normas, criterios, modelos." },
    { titulo: "Conversaciones", texto: "Cada chat nuevo del proyecto ya arranca con esas instrucciones y esos archivos." },
  ],
  skill: [
    { titulo: "Una carpeta con un SKILL.md", texto: "Nombre, descripción de cuándo usarla y los pasos a seguir." },
    { titulo: "Plantillas y ejemplos", texto: "Los recursos que la skill necesita para hacer bien la tarea." },
    { titulo: "Se sube y se activa", texto: "Se comprime en .zip y se carga en Configuración → Capacidades. La herramienta la usa cuando el pedido coincide con la descripción." },
  ],
  tarea: [
    { titulo: "Se crea desde el chat", texto: "Basta con pedirlo: «cada lunes a las 7, resuma…»." },
    { titulo: "Frecuencia y próxima ejecución", texto: "Se puede pausar, editar o borrar en cualquier momento." },
    { titulo: "Avisa cuando termina", texto: "El resultado llega como notificación; la persona lo revisa antes de usarlo." },
  ],
  memoria: [
    { titulo: "Se activa o desactiva", texto: "Desde la configuración, en cualquier momento." },
    { titulo: "Lo que recuerda, a la vista", texto: "Cada recuerdo se puede leer, editar o borrar." },
    { titulo: "Lo sensible no se guarda", texto: "Datos de casos o de personas: afuera de la memoria de herramientas externas." },
  ],
};

// --- Proyecto -------------------------------------------------------------------------

function CapturaProyecto() {
  return (
    <Ventana app="Claude" ruta="claude.ai/project/pgr-familia">
      <div className="grid min-h-[20rem] grid-cols-[9.5rem_1fr] text-[13px] sm:grid-cols-[11rem_1fr]">
        <aside className="border-r border-zinc-200 bg-zinc-50 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Proyectos</p>
          {["PGR · Familia", "Mediación comunitaria", "Capacitación interna"].map((p, i) => (
            <p
              key={p}
              className={cn("mb-1 truncate rounded-md px-2 py-1.5", i === 0 ? "bg-orange-100 font-semibold text-orange-900" : "text-zinc-600")}
            >
              📁 {p}
            </p>
          ))}
        </aside>
        <div className="space-y-3 p-4">
          <div>
            <p className="text-base font-semibold">PGR · Familia — cuotas alimenticias</p>
            <p className="text-xs text-zinc-500">Proyecto de trabajo · 3 personas</p>
          </div>
          <div className="rise relative rounded-lg border border-zinc-200 bg-zinc-50 p-3" style={{ animationDelay: "0.15s" }}>
            <Marca n={1} className="absolute -left-3 -top-3" />
            <p className="mb-1 text-[11px] font-semibold text-zinc-500">Instrucciones del proyecto</p>
            <p className="leading-relaxed text-zinc-700">
              Usted asiste a defensores públicos de familia. Responda solo con base en los archivos del proyecto. Si falta
              información, indíquelo. Use lenguaje claro.
            </p>
          </div>
          <div className="rise relative rounded-lg border border-zinc-200 p-3" style={{ animationDelay: "0.3s" }}>
            <Marca n={2} className="absolute -left-3 -top-3" />
            <p className="mb-1.5 text-[11px] font-semibold text-zinc-500">Archivos del proyecto · 4</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["Código de Familia (extracto).pdf", "Criterios internos de cuota.docx", "Modelo de solicitud.docx", "Tabla de gastos 2026.xlsx"].map(
                (f) => (
                  <span key={f} className="truncate rounded-md bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600">
                    📄 {f}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="rise relative rounded-lg border border-zinc-200 p-3" style={{ animationDelay: "0.45s" }}>
            <Marca n={3} className="absolute -left-3 -top-3" />
            <p className="mb-1 text-[11px] font-semibold text-zinc-500">Conversaciones</p>
            <p className="text-zinc-700">💬 Cálculo de cuota — caso ficticio A</p>
            <p className="text-zinc-700">💬 Preparación de audiencia conciliatoria</p>
          </div>
        </div>
      </div>
    </Ventana>
  );
}

// --- Skill ------------------------------------------------------------------------------

function CapturaSkill() {
  const lineas = [
    { t: "---", c: "text-zinc-400" },
    { t: "name: oficio-lenguaje-claro", c: "text-violet-700" },
    { t: "description: Redacta oficios y notificaciones en", c: "text-violet-700" },
    { t: "  lenguaje claro. Úsese cuando se pida redactar", c: "text-violet-700" },
    { t: "  o simplificar una comunicación a una persona.", c: "text-violet-700" },
    { t: "---", c: "text-zinc-400" },
    { t: "# Oficio en lenguaje claro", c: "font-semibold text-zinc-800" },
    { t: "1. Identifique destinatario, pedido y plazo.", c: "text-zinc-700" },
    { t: "2. Use plantilla-oficio.docx.", c: "text-zinc-700" },
    { t: "3. Oraciones cortas, sin latinismos.", c: "text-zinc-700" },
    { t: "4. Verifique fechas y plazos contra el original.", c: "text-zinc-700" },
  ];
  return (
    <Ventana app="Claude" ruta="oficio-lenguaje-claro/SKILL.md">
      <div className="grid min-h-[20rem] grid-cols-[10rem_1fr] text-[13px] sm:grid-cols-[12rem_1fr]">
        <aside className="relative border-r border-zinc-200 bg-zinc-50 p-3 font-mono text-[12px]">
          <Marca n={2} className="absolute -right-3 top-16" />
          <p className="text-zinc-500">📁 oficio-lenguaje-claro/</p>
          <p className="ml-3 mt-1 rounded bg-orange-100 px-1.5 py-0.5 font-semibold text-orange-900">📄 SKILL.md</p>
          <p className="ml-3 mt-1 text-zinc-600">📄 plantilla-oficio.docx</p>
          <p className="ml-3 mt-1 text-zinc-600">📄 ejemplos.md</p>
          <div className="relative mt-6 rounded-lg border border-zinc-200 bg-white p-2 font-sans">
            <Marca n={3} className="absolute -right-3 -top-3" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Capacidades · Skills</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-[11px] text-zinc-700">oficio-lenguaje-claro</span>
              <span className="relative h-4 w-7 shrink-0 rounded-full bg-emerald-500">
                <span className="absolute right-0.5 top-0.5 size-3 rounded-full bg-white" />
              </span>
            </div>
            <p className="mt-2 rounded border border-dashed border-zinc-300 py-1 text-center text-[10px] text-zinc-500">⬆ Subir skill (.zip)</p>
          </div>
        </aside>
        <div className="relative p-4 font-mono text-[12px] leading-relaxed">
          <Marca n={1} className="absolute -left-3 top-3" />
          {lineas.map((l, i) => (
            <p key={i} className={cn("rise whitespace-pre", l.c)} style={{ animationDelay: `${0.1 + i * 0.07}s` }}>
              {l.t}
            </p>
          ))}
        </div>
      </div>
    </Ventana>
  );
}

// --- Tarea programada ------------------------------------------------------------------

function CapturaTarea() {
  return (
    <Ventana app="ChatGPT" ruta="chatgpt.com/tasks">
      <div className="relative min-h-[20rem] space-y-3 p-4 text-[13px]">
        <div className="rise relative ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-100 px-3 py-2 text-zinc-700">
          <Marca n={1} className="absolute -left-3 -top-3" />
          Cada lunes a las 7:00, busque las resoluciones nuevas sobre cuota alimenticia y resúmalas en cinco puntos, con su
          enlace.
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Tareas programadas</p>
        {[
          { t: "Resumen semanal de jurisprudencia de familia", f: "Cada lunes · 7:00", p: "Próxima: lun 21/09, 7:00", on: true },
          { t: "Audiencias del día", f: "Todos los días · 6:30", p: "Próxima: mañana, 6:30", on: true },
          { t: "Vencimientos de la semana", f: "Cada viernes · 16:00", p: "En pausa", on: false },
        ].map((k, i) => (
          <div key={k.t} className="rise relative flex items-center gap-3 rounded-xl border border-zinc-200 p-3" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
            {i === 0 && <Marca n={2} className="absolute -left-3 -top-3" />}
            <span className="text-lg">⏰</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-zinc-800">{k.t}</p>
              <p className="text-[11px] text-zinc-500">
                {k.f} · {k.p}
              </p>
            </div>
            <span className={cn("relative h-4 w-7 shrink-0 rounded-full", k.on ? "bg-emerald-500" : "bg-zinc-300")}>
              <span className={cn("absolute top-0.5 size-3 rounded-full bg-white", k.on ? "right-0.5" : "left-0.5")} />
            </span>
          </div>
        ))}
        <div className="rise relative ml-auto flex max-w-[16rem] items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 shadow-lg" style={{ animationDelay: "1.1s" }}>
          <Marca n={3} className="absolute -left-3 -top-3" />
          <span>✅</span>
          <p className="text-[12px] leading-snug text-emerald-900">
            <b>Tarea completada</b>
            <br />
            Resumen semanal: 4 resoluciones nuevas.
          </p>
        </div>
      </div>
    </Ventana>
  );
}

// --- Memoria ----------------------------------------------------------------------------

function CapturaMemoria() {
  const recuerdos = [
    { t: "Trabaja como defensora pública en la PGR, área de familia.", riesgo: false },
    { t: "Prefiere respuestas en lenguaje claro y con viñetas.", riesgo: false },
    { t: "Redacta los escritos en tercera persona.", riesgo: false },
    { t: "Caso de la señora R. G.: cuota de US$ 150, domicilio en…", riesgo: true },
  ];
  return (
    <Ventana app="ChatGPT" ruta="Configuración › Personalización › Memoria">
      <div className="min-h-[20rem] space-y-3 p-4 text-[13px]">
        <div className="relative flex items-center justify-between rounded-xl border border-zinc-200 p-3">
          <Marca n={1} className="absolute -left-3 -top-3" />
          <div>
            <p className="font-semibold text-zinc-800">Consultar memorias guardadas</p>
            <p className="text-[11px] text-zinc-500">Usa lo que recuerda para personalizar las respuestas.</p>
          </div>
          <span className="relative h-5 w-9 shrink-0 rounded-full bg-emerald-500">
            <span className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
          </span>
        </div>
        <div className="relative rounded-xl border border-zinc-200">
          <Marca n={2} className="absolute -left-3 -top-3" />
          <p className="border-b border-zinc-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Memorias guardadas</p>
          {recuerdos.map((r, i) => (
            <div
              key={r.t}
              className={cn(
                "rise flex items-center gap-3 border-b border-zinc-100 px-3 py-2 last:border-b-0",
                r.riesgo && "bg-red-50",
              )}
              style={{ animationDelay: `${0.2 + i * 0.12}s` }}
            >
              {r.riesgo && <Marca n={3} className="-ml-1" />}
              <p className={cn("min-w-0 flex-1", r.riesgo ? "text-red-700 line-through decoration-red-400" : "text-zinc-700")}>{r.t}</p>
              <span className={cn("shrink-0 text-sm", r.riesgo ? "text-red-500" : "text-zinc-300")}>🗑</span>
            </div>
          ))}
        </div>
        <div className="rise flex justify-end" style={{ animationDelay: "0.8s" }}>
          <div className="rounded-2xl rounded-br-sm bg-zinc-100 px-3 py-2 text-zinc-700">Recuerde que trabajo en el área de familia.</div>
        </div>
        <p className="rise text-[11px] font-medium text-zinc-500" style={{ animationDelay: "1s" }}>
          ✓ Memoria actualizada
        </p>
      </div>
    </Ventana>
  );
}
