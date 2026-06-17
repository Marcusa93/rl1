import type { ActivityKey, CotioVar } from "./types";

export const APP_NAME = "RL1";
export const WORKSHOP_TITLE = "IA en la abogacía: del uso intuitivo al método";

// Una sola clase fija (sin códigos): todos comparten esta sesión, que se auto-crea.
export const DEFAULT_SLUG = "taller";

// --- Agenda / flujo de la clase (orden en que el docente activa) ---

export interface AgendaStep {
  key: ActivityKey;
  label: string;
  short: string;
  desc: string;
}

export const AGENDA: AgendaStep[] = [
  {
    key: "lobby",
    label: "Sala de espera",
    short: "Ingreso",
    desc: "Los participantes entran con su nombre y esperan el inicio.",
  },
  {
    key: "encuesta",
    label: "Encuesta relámpago",
    short: "Encuesta",
    desc: "Tres preguntas rápidas para conocer al grupo: si ya usaron IA, dónde ejercen y qué herramienta usan.",
  },
  {
    key: "diagnostico",
    label: "Tarjetas de actividades",
    short: "Leer al grupo",
    desc: "Cada uno marca qué tareas jurídicas ya hizo con IA. Gráfico en vivo para leer al grupo antes de arrancar.",
  },
  {
    key: "verdadero_falso",
    label: "Verdadero o falso",
    short: "V/F",
    desc: "Ocho afirmaciones sobre IA generativa para consolidar conceptos y debatir (tokens y alucinación). El docente avanza y revela.",
  },
  {
    key: "memoria",
    label: "Memorias y Proyectos en la IA",
    short: "Memoria",
    desc: "Qué es la memoria persistente (en Claude, ChatGPT y Gemini), cómo gestionarla y qué son los proyectos.",
  },
  {
    key: "cotio",
    label: "Optimizador COTIO",
    short: "COTIO",
    desc: "El participante escribe un prompt natural y la IA lo analiza variable por variable (Contexto, Objeto, Tarea, Input, Output).",
  },
  {
    key: "chat",
    label: "Asistente IA (práctica libre)",
    short: "Asistente",
    desc: "Chat de IA dentro de la app para que experimenten: probar prompts, redactar, resumir. Con recordatorio de confidencialidad.",
  },
  {
    key: "caso",
    label: "Ejercicio: el caso Fernández",
    short: "Caso Fernández",
    desc: "Cada grupo recibe el resumen del expediente y la consigna. Construyen el prompt con COTIO y trabajan en Claude.",
  },
  {
    key: "tarea",
    label: "Tarea bisagra",
    short: "Cierre",
    desc: "Usar la herramienta en un caso real propio durante la semana y traer prompt + output a la Clase 2.",
  },
];

export function agendaStep(key: ActivityKey): AgendaStep {
  return AGENDA.find((a) => a.key === key) ?? AGENDA[0];
}

// --- Juego · Encuesta relámpago ---

export interface EncuestaOption {
  id: string;
  label: string;
  emoji: string;
}
export interface EncuestaQuestion {
  id: string;
  q: string;
  options: EncuestaOption[];
  multi?: boolean; // permite marcar más de una opción
}

export const ENCUESTA_QUESTIONS: EncuestaQuestion[] = [
  {
    id: "uso",
    q: "¿Ya usaste IA para trabajar?",
    options: [
      { id: "si", label: "Sí", emoji: "✅" },
      { id: "no", label: "No", emoji: "❌" },
    ],
  },
  {
    id: "sector",
    q: "¿Dónde ejercés?",
    options: [
      { id: "publico", label: "Oficina pública", emoji: "🏛️" },
      { id: "privado", label: "Sector privado", emoji: "💼" },
    ],
  },
  {
    id: "dato",
    q: "Para un buen resultado de IA, ¿qué pesa más?",
    options: [
      { id: "datos", label: "Los datos que le doy", emoji: "📊" },
      { id: "prompt", label: "Cómo lo pido", emoji: "✍️" },
      { id: "herramienta", label: "La herramienta", emoji: "🛠️" },
      { id: "todas", label: "Las tres", emoji: "🎯" },
    ],
  },
  {
    id: "cual",
    q: "¿Qué IA usás? (podés marcar varias)",
    multi: true,
    options: [
      { id: "claude", label: "Claude", emoji: "🟣" },
      { id: "gpt", label: "ChatGPT", emoji: "🟢" },
      { id: "gemini", label: "Gemini", emoji: "🔵" },
      { id: "notebooklm", label: "NotebookLM", emoji: "📓" },
      { id: "otra", label: "Otra", emoji: "✨" },
    ],
  },
];

// --- Links para abrir el prompt en otra IA ---

export const AI_LINKS = [
  { id: "gpt", label: "ChatGPT", base: "https://chatgpt.com/", q: "https://chatgpt.com/?q=" },
  { id: "claude", label: "Claude", base: "https://claude.ai/new", q: "https://claude.ai/new?q=" },
  { id: "gemini", label: "Gemini", base: "https://gemini.google.com/app", q: "" },
] as const;

// --- Módulo 1 · Tarjetas (tareas jurídicas con IA) ---

export interface DiagCard {
  id: string;
  emoji: string;
  label: string;
}

export const DIAGNOSTICO_CARDS: DiagCard[] = [
  { id: "escrito", emoji: "✍️", label: "Redacté o mejoré un escrito judicial" },
  { id: "resumen", emoji: "📄", label: "Resumí un expediente o documento largo" },
  { id: "jurisprudencia", emoji: "⚖️", label: "Busqué o analicé jurisprudencia" },
  { id: "audiencia", emoji: "🎙️", label: "Preparé argumentos para una audiencia" },
  { id: "consulta", emoji: "💬", label: "Respondí una consulta de cliente" },
  { id: "contrato", emoji: "📑", label: "Revisé o redacté un contrato" },
  { id: "doctrina", emoji: "📚", label: "Investigué doctrina o legislación" },
  { id: "estrategia", emoji: "🧠", label: "Generé ideas para una estrategia procesal" },
  { id: "traduje", emoji: "🌐", label: "Traduje o adapté un documento" },
  { id: "organice", emoji: "🗂️", label: "Organicé o planifiqué tareas del estudio" },
  { id: "nunca", emoji: "🚫", label: "No la usé nunca" },
];

// --- Módulo 2 · Verdadero / Falso (8 afirmaciones) ---

export interface VFItem {
  statement: string;
  answer: boolean; // true = verdadero
  explain: string;
}

export const VF_ITEMS: VFItem[] = [
  {
    statement: "La IA busca información en internet en tiempo real.",
    answer: false,
    explain:
      "Falso. Los modelos trabajan con el conocimiento incorporado durante su entrenamiento. No navegan internet salvo que tengan una herramienta de búsqueda activada.",
  },
  {
    statement: "El resultado que da la IA depende mucho de cómo le preguntás.",
    answer: true,
    explain:
      "Verdadero. La calidad y precisión del prompt determina directamente la calidad del output. Es la premisa central del método COTIO.",
  },
  {
    statement: "La IA siempre cita jurisprudencia correctamente.",
    answer: false,
    explain:
      "Falso. Los modelos pueden generar citas de jurisprudencia inexistente con datos verosímiles. Se llama alucinación y es una limitación estructural, no un error ocasional.",
  },
  {
    statement: "Puedo usar la IA para redactar pero siempre tengo que verificar el contenido.",
    answer: true,
    explain:
      "Verdadero. La IA produce borradores inteligentes. La verificación jurídica del contenido es siempre responsabilidad del profesional.",
  },
  {
    statement: "La IA entiende el derecho igual que un abogado.",
    answer: false,
    explain:
      "Falso. Procesa patrones del lenguaje jurídico, pero no tiene criterio profesional, no conoce el expediente real, no tiene responsabilidad ética ni puede valorar prueba.",
  },
  {
    statement: "Darle más contexto a la IA generalmente mejora la respuesta.",
    answer: true,
    explain:
      "Verdadero. Cuanta más información relevante tenga el prompt, más ajustado al caso real será el output. El contexto es la primera variable de COTIO por algo.",
  },
  {
    statement: "Si la IA dice algo con mucha seguridad, es porque es correcto.",
    answer: false,
    explain:
      "Falso. El modelo genera texto con el mismo tono de confianza sea correcto o incorrecto. La seguridad del tono no es indicador de precisión factual.",
  },
  {
    statement: "Puedo pedirle a la IA que adopte un rol específico para obtener mejores resultados.",
    answer: true,
    explain:
      "Verdadero. Definir un rol (ej. 'actuá como asistente de un estudio jurídico laboral') mejora la coherencia y el tono del output.",
  },
];

// --- Módulo 3 · COTIO (Contexto, Objeto, Tarea, Input, Output) ---

export interface CotioVarDef {
  key: CotioVar;
  letter: string;
  name: string;
  question: string;
  placeholder: string;
}

export const COTIO_VARS: CotioVarDef[] = [
  {
    key: "contexto",
    letter: "C",
    name: "Contexto",
    question: "¿Quién sos y en qué situación trabajás?",
    placeholder:
      "Soy abogado/a laboralista en CABA, represento a la parte actora en una causa por despido sin causa.",
  },
  {
    key: "objeto",
    letter: "O",
    name: "Objeto",
    question: "¿Qué querés lograr con el output?",
    placeholder: "Quiero redactar la sección de hechos de una demanda laboral.",
  },
  {
    key: "tarea",
    letter: "T",
    name: "Tarea",
    question: "¿Qué tiene que hacer exactamente la IA?",
    placeholder:
      "Redactá los hechos en orden cronológico, en primera persona del plural, tono formal, solo narración factual sin valoraciones.",
  },
  {
    key: "input",
    letter: "I",
    name: "Input",
    question: "¿Qué material le das para trabajar?",
    placeholder:
      "Te paso el resumen estructurado de la causa: hechos denunciados, prueba producida y alegatos de ambas partes. (Sin datos sensibles reales.)",
  },
  {
    key: "output",
    letter: "O",
    name: "Output",
    question: "¿Cómo querés que entregue el resultado?",
    placeholder:
      "Texto listo para insertar en un escrito judicial, sin encabezados ni fórmulas procesales, en no más de 400 palabras.",
  },
];

// --- Módulo 4 · Caso Fernández (trabajo externo en Claude) ---
// NOTA: caso ficticio de ejemplo. Reemplazá libremente por el expediente real del taller.

export const CASO_FERNANDEZ_MD = `## Expediente: "Fernández, María c/ Distribuidora del Norte S.A. s/ despido"

**Fuero:** Laboral · **Jurisdicción:** CABA · **Posición:** parte actora

### Hechos
- **Ingreso:** 3/4/2017. Categoría: vendedora (CCT 130/75, empleados de comercio).
- **Remuneración:** $480.000 mensuales (último período), más comisiones variables.
- **Jornada:** lunes a viernes 9 a 18 h; se alega trabajo habitual los sábados sin registración.
- **Despido:** 12/2/2024, sin expresión de causa, comunicado por telegrama.
- La actora intimó previamente (CD del 5/2/2024) por registración defectuosa de la jornada y pago de comisiones adeudadas. No hubo respuesta.

### Prueba ofrecida
- Telegramas y cartas documento (intercambio epistolar completo).
- Recibos de sueldo 2022–2024.
- Testigos: dos excompañeras de trabajo.
- Pericia contable sobre libros del art. 52 LCT.

### Posición de la demandada (contestación)
- Reconoce la relación laboral y el despido sin causa.
- Niega trabajo los sábados y la existencia de comisiones impagas.
- Ofrece liquidación final ya abonada.

### Rubros reclamados
Indemnización por antigüedad, preaviso, integración mes de despido, SAC y vacaciones proporcionales, multas (arts. 2 ley 25.323 y 80 LCT), diferencias por comisiones.`;

export const CASO_FERNANDEZ_CONSIGNA =
  "Usando el método COTIO y este resumen como Input, construí en Claude un prompt para redactar la sección de HECHOS de la demanda. Cubrí las cinco variables. Después comparen, dentro del grupo, qué prompt dio mejor resultado y por qué.";

export const CLAUDE_URL = "https://claude.ai/new";

// --- Módulo · Memorias y Proyectos en Claude ---

export interface InfoCard {
  icon: string;
  title: string;
  body: string;
}

export const MEMORIA_CARDS: InfoCard[] = [
  {
    icon: "🧠",
    title: "¿Qué es la Memoria?",
    body: "Las IA (Claude, ChatGPT, Gemini) pueden recordar datos y preferencias entre conversaciones. No arrancás de cero cada vez: retienen lo que les pedís que recuerden.",
  },
  {
    icon: "⚖️",
    title: "Para qué te sirve",
    body: "Guardá tu rol, jurisdicción, estilo de redacción y formatos de escrito. Dejás de repetir el mismo contexto en cada chat, en cualquier herramienta.",
  },
  {
    icon: "🎛️",
    title: "Cómo gestionarla",
    body: "Activala o desactivala cuando quieras, revisá y editá lo que recordó, y borrá memorias puntuales o todas. El control siempre es tuyo.",
  },
  {
    icon: "🗣️",
    title: "Decíselo explícito",
    body: '"Recordá que soy abogado laboralista en Tucumán y escribo en estilo formal" o "olvidá lo de…". Lo guarda o lo borra al toque.',
  },
  {
    icon: "🧭",
    title: "Dónde está en cada una",
    body: "Claude: Memoria + Proyectos. ChatGPT: Memoria + Proyectos/GPTs. Gemini: Información guardada + Gems. Cambia el nombre, no la idea.",
  },
  {
    icon: "📁",
    title: "Proyectos / espacios",
    body: "Espacios con instrucciones y archivos propios. Lo que cargás vive ahí: ideal para un caso o una materia, con contexto persistente y separado del resto.",
  },
  {
    icon: "💡",
    title: "Cuándo conviene",
    body: "Para lo estable (tu rol, tus formatos). Para datos de un caso puntual que cambian, mejor pasarlos en el momento y no dejarlos fijos.",
  },
];

export interface MemoriaLink {
  tool: string;
  hint: string;
  links: { label: string; url: string }[];
}

export const MEMORIA_LINKS: MemoriaLink[] = [
  {
    tool: "Claude",
    hint: "Ajustes → Memoria · y la sección Proyectos",
    links: [
      { label: "Ajustes", url: "https://claude.ai/settings/profile" },
      { label: "Proyectos", url: "https://claude.ai/projects" },
    ],
  },
  {
    tool: "ChatGPT",
    hint: "Ajustes → Personalización → Memoria · y GPTs/Proyectos",
    links: [
      { label: "Personalización", url: "https://chatgpt.com/#settings/Personalization" },
      { label: "GPTs", url: "https://chatgpt.com/gpts" },
    ],
  },
  {
    tool: "Gemini",
    hint: "Ajustes → Información guardada · y Gems",
    links: [
      { label: "Información guardada", url: "https://gemini.google.com/saved-info" },
      { label: "Gems", url: "https://gemini.google.com/gems/view" },
    ],
  },
];

// --- Conceptos del bloque de IA generativa (intro al V/F) ---

export const COURSE_BLOCKS = {
  tokens:
    "Tokens: la IA no entiende letras, parte el texto en fragmentos y predice el siguiente. Por eso el prompt importa a nivel técnico — no es 'pedir bien', es darle la mejor base para predecir.",
  alucinacion:
    "Alucinación: el modelo puede inventar con tono seguro (fallos, artículos, citas). El abogado nunca baja la guardia: todo lo que va a un expediente se verifica.",
};
