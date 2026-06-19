// ============================================================
// Expediente Vivo — Laboratorio de litigación asistida por IA
// Diplomatura en IA y Derecho · UNT
//
// Contenido y modelo del laboratorio. La IA NO corre dentro de la app:
// cada participante usa su propio chat (Claude / ChatGPT / Gemini). La app
// administra el RITMO y la ASIMETRÍA de información (desbloqueo por etapas),
// entrega los prompts para copiar y recolecta la ficha de decisión.
// ============================================================

export const EXP_SLUG = "expediente";
export const EXP_TITLE = "Expediente Vivo — Litigación asistida por IA";

export type CasoId = "laboral" | "civil" | "penal";

// --- System prompt de la IA (para pegar al inicio del chat propio) ---
// Es el mismo para los tres casos. El participante lo pega como primera
// instrucción en Claude/ChatGPT/Gemini antes de trabajar el caso.
export const SYSTEM_PROMPT = `Sos un consultor jurídico especializado en derecho argentino.
Estás operando dentro de una plataforma de simulación pedagógica.

TUS REGLAS:
1. Nunca resolvés el caso de forma directa ni tomás decisiones por mí.
2. No redactás demandas, querellas ni escritos completos en las etapas 1 a 6.
3. No inventás jurisprudencia. Si no sabés si un fallo existe, lo decís.
4. No anticipás información de etapas posteriores.
5. Siempre exigís que justifique mis decisiones estratégicas.
6. Cuando detectás un riesgo de alucinación propio, lo señalás explícitamente.
7. Actuás como interlocutor dialéctico: hacés preguntas que obligan a pensar.

Si te pido que redactes la demanda completa antes de la etapa 9, declinás con
amabilidad y me preguntás qué análisis falta completar.`;

// --- Los cuatro roles de la deliberación (etapa 8, comunes a los 3 casos) ---
export interface Rol {
  id: string;
  nombre: string;
  mision: string;
}
export const ROLES: Rol[] = [
  {
    id: "actor",
    nombre: "Abogado del actor",
    mision:
      "Argumentar la posición del cliente con el mejor encuadre jurídico disponible y las pruebas más fuertes.",
  },
  {
    id: "demandado",
    nombre: "Abogado de la contraparte",
    mision:
      "Atacar la estrategia del actor: encontrar los argumentos más débiles, los hechos no probados y la doctrina favorable a la defensa.",
  },
  {
    id: "juez",
    nombre: "Juez escéptico",
    mision:
      "Analizar si la estrategia del actor sobrevive al escrutinio judicial. ¿Qué rechazarías in limine?",
  },
  {
    id: "auditor",
    nombre: "Auditor probatorio",
    mision:
      "Evaluar la cadena de custodia de cada prueba. ¿Qué es admisible? ¿Qué tiene problemas de integridad digital?",
  },
];

// --- Estructura de un caso ---
export interface Hipotesis {
  id: string;
  titulo: string;
  texto: string;
}
export interface Documento {
  id: string;
  titulo: string;
  contenido: string;
  problema: string;
}
export interface Caso {
  id: CasoId;
  area: string;
  emoji: string;
  titulo: string;
  caratula: string;
  marcoNormativo: string;
  objetivo: string;
  /** Relato emocional del cliente — etapa 2. */
  relato: string;
  /** Lo que aparece al interrogar bien — etapa 4 (ampliación por entrevista). */
  ampliacion: string[];
  /** Riesgos de alucinación específicos del caso. */
  riesgosIA: string[];
  /** Tres hipótesis posibles — etapa 6. */
  hipotesis: Hipotesis[];
  /** Cinco documentos ficticios — etapa 5. */
  documentos: Documento[];
  /** Dato sorpresa — etapa 7. */
  datoSorpresa: string;
  /** Prompt COTIO para el diagnóstico — etapa 3 (para copiar al chat propio). */
  cotioPrompt: string;
}

export const CASOS: Caso[] = [
  // ===================== CASO 1 — LABORAL =====================
  {
    id: "laboral",
    area: "Laboral",
    emoji: "⚙️",
    titulo: "El Algoritmo de la Dependencia",
    caratula: "Logística Express S.A. c/ Galván",
    marcoNormativo:
      "Ley de Bases N° 27.742 y Decreto 847/2024. LCT art. 23 reformado (desactiva la presunción de laboralidad ante facturación bancarizada). Art. 14 LCT (fraude laboral). Art. 97 Ley 27.742 (trabajadores independientes colaboradores). Art. 245 LCT (indemnización por despido).",
    objetivo:
      "Evaluar críticamente el impacto del nuevo art. 23 LCT frente a indicios fácticos de control algorítmico y subordinación delegada. El caso pone en tensión el encuadre formal (monotributo, contrato comercial) con la realidad del vínculo (geolocalización, bloqueos de cuenta, uniforme, exclusividad económica).",
    relato:
      "Che, miren, les vengo a ver porque me quedé en la calle de un día para el otro y estos tipos de Logística Express S.A. se lavan las manos. Laburé tres años seguidos como coordinador de reparto en zona norte. Me hicieron inscribir en el monotributo y facturarles todos los meses. Usaba mi propia camioneta para repartir paquetes. En la empresa me dicen que yo era un contratista independiente, que no tengo derecho a indemnización y que el contrato comercial que firmé les permite rescindir el servicio mandando un simple mail. Pero la verdad es que yo no manejaba mis horarios: si no me conectaba a las ocho de la mañana en la aplicación de ruteo de ellos, me suspendían la cuenta y me dejaban sin laburar por tres días. Además, tenía que usar una remera roja con el logo de la firma y el gerente de operaciones me obligaba a coordinar a otros tres fleteros que andaban por mi zona. Quiero que les hagamos un juicio millonario y les cobremos todas las multas por haberme tenido en negro.",
    ampliacion: [
      "Exclusividad económica absoluta: el 100% de sus ingresos provenía de un único cliente, Logística Express S.A.",
      "Control disciplinario automatizado: la app LogiTrack le aplicaba bloqueos de cuenta de 24 a 48 horas cuando se desviaba de la ruta o se detenía demasiado tiempo.",
      "Uso obligatorio de uniforme corporativo (remera roja con el logo de la firma).",
      "Antigüedad ininterrumpida de 3 años en tareas habituales y normales de la empresa.",
      "Punto débil: Galván es propietario de la camioneta (medio de producción de alto valor) y emitía facturas electrónicas tipo C de forma regular, habiendo suscripto voluntariamente un contrato comercial con exclusión explícita de laboralidad.",
    ],
    riesgosIA: [
      "Invocar multas de las Leyes 24.013 y 25.323, derogadas por la Ley de Bases.",
      "Sobreestimar el valor probatorio de los chats de WhatsApp sin advertir la falta de hash forense.",
      "Aplicar precedentes de la Directiva de Trabajo en Plataformas de la UE ignorando el derecho positivo argentino.",
    ],
    hipotesis: [
      {
        id: "h1",
        titulo: "Relación de dependencia por fraude de ley (art. 14 LCT)",
        texto:
          "El contrato comercial es nulo por simulación fraudulenta. Las notas de subordinación técnica y jurídica demuestran que Galván era empleado. Corresponde indemnización por despido (art. 245 LCT).",
      },
      {
        id: "h2",
        titulo: "Colaboradores independientes desnaturalizados (art. 97 Ley 27.742)",
        texto:
          "La empresa usó fraudulentamente la figura del art. 97 para delegar su poder de dirección sobre otros tres fleteros vía Galván. Genera responsabilidad laboral directa de Logística Express S.A.",
      },
      {
        id: "h3",
        titulo: "Caso inmaduro para litigio (salida negociable)",
        texto:
          "Ante la rigurosidad del nuevo art. 23 LCT el caso presenta alto riesgo de rechazo judicial. La estrategia adecuada es transitar el SECLO sin demanda inmediata, usando los correos de sanción como presión para una transacción.",
      },
    ],
    documentos: [
      {
        id: "d1",
        titulo: "Contrato de locación de servicios comerciales",
        contenido:
          "Documenta la defensa contractual de la empresa. Formaliza el encuadre de autonomía y la exclusión de laboralidad.",
        problema:
          "Contrato de adhesión cuyas cláusulas colisionan con las órdenes diarias del software LogiTrack.",
      },
      {
        id: "d2",
        titulo: "Transcripción de chat de WhatsApp «Reparto Centro»",
        contenido:
          "Gerente: «Galván, la app marca que tu camioneta está parada en el café hace 15 minutos. Si no te movés en 5 minutos te suspendo el ruteo.» Evidencia control, subordinación y poder disciplinario.",
        problema:
          "Transcripción manual en texto plano, sin hash forense ni firma digital. Fácil de impugnar.",
      },
      {
        id: "d3",
        titulo: "Factura electrónica tipo C de AFIP",
        contenido:
          "Demuestra el cumplimiento de las formalidades fiscales que excluyen la presunción del art. 23 LCT.",
        problema:
          "El concepto dice «coordinación logística», excediendo el mero flete e introduciendo sospecha de intermediación de personal.",
      },
      {
        id: "d4",
        titulo: "Telegrama de intimación colacionado",
        contenido:
          "Configura la constitución en mora formal previa al inicio del juicio ordinario.",
        problema:
          "Invoca indebidamente registración por leyes sancionatorias ya derogadas por la Ley de Bases.",
      },
      {
        id: "d5",
        titulo: "Captura de pantalla del software LogiTrack",
        contenido:
          "Historial de penalidades: «Desvío de ruta detectado por GPS. Bloqueo automático por 48 horas.» Demuestra subordinación técnica y sanciones algorítmicas.",
        problema:
          "Captura de imagen digital sin pericia de sistemas sobre la plataforma original. Fácilmente impugnable.",
      },
    ],
    datoSorpresa:
      "Aparece un acta de AFIP donde un inspector de ruta labró acta contra uno de los tres fleteros coordinados por Galván. El fletero declaró que su único jefe —el que le pagaba y le daba órdenes— era Ernesto Galván. Esto expone a Galván a que la empresa lo demande por intermediación ilegal: el mismo hecho que fortalece una hipótesis lo vuelve vulnerable en otra.",
    cotioPrompt: `[CONTEXTO]: Sos abogado especialista en derecho del trabajo argentino, con amplio conocimiento de la Ley de Bases N° 27.742 y Decreto 847/2024.

[OBJETO]: Análisis crítico del relato de un monotributista que pretende demandar laboralmente a una empresa de logística.

[TAREA]: Identificá:
1. Hechos que demuestran subordinación jurídica, técnica y económica.
2. Obstáculos que la empresa interpondrá con fundamento en el nuevo art. 23 LCT.
3. Tres datos críticos ausentes que debo preguntarle al cliente.
4. Alertas sobre alucinaciones que el modelo podría cometer al encuadrar el caso.

[INPUT]: (pegá acá el relato inicial del cliente)

[OUTPUT]:
SECCIÓN A: Matriz indicios de subordinación vs. elementos de autonomía.
SECCIÓN B: Análisis de viabilidad de la presunción laboral (art. 23 LCT).
SECCIÓN C: Tres preguntas clave para el cliente.
SECCIÓN D: Alertas de normas derogadas que no deben invocarse.

// Importante: no redactes telegrama ni demanda en esta etapa.`,
  },

  // ===================== CASO 2 — CIVIL =====================
  {
    id: "civil",
    area: "Civil",
    emoji: "🌐",
    titulo: "Secreto Industrial en la Nube",
    caratula: "AgroTech S.A. c/ Benítez s/ Acción Preventiva",
    marcoNormativo:
      "CCyC arts. 1710 a 1713 (función preventiva del derecho de daños). Art. 1711 (mandato de prevención). Art. 1031 CCyC (excepción de incumplimiento contractual). Libertad de expresión y prohibición de censura previa (CN art. 14). Ley de Patentes y secreto industrial.",
    objetivo:
      "Ponderar la procedencia de la acción inhibitoria urgente frente al derecho de libertad de expresión. El caso oculta un dato crítico que cambia todo: el software tiene un error del 35% que la empresa conocía y ocultó en su publicidad comercial. Iniciar el litigio expone ese fraude.",
    relato:
      "Doctor, nos están vaciando el valor comercial de la compañía y si no frenamos esto ya, AgroTech S.A. va a la quiebra. Desarrollamos un algoritmo predictivo de plagas agrícolas único en el país que les licenciamos a las principales cooperativas de la Pampa Húmeda. Hace dos días, un exingeniero de sistemas de la firma, el Ing. Marcos Benítez, que se fue de la empresa muy enojado por un tema de plata, empezó a subir a LinkedIn y a repositorios de GitHub partes del código de nuestro algoritmo. Además, publica barbaridades diciendo que nuestro software es un fraude, que tiene un error técnico gigante y que dibujamos los datos en el servidor para obligar a la gente a comprar pesticidas de laboratorios amigos. Por culpa de sus posteos, dos cooperativas grandes nos acaban de suspender preventivamente las licencias. El presidente del directorio me pide que logremos que un juez le ordene borrar todo lo que subió y que le clavemos un juicio de daños y perjuicios de cincuenta millones de pesos.",
    ampliacion: [
      "Hay un NDA escrito y vigente que obliga a Benítez a guardar confidencialidad, con cláusula penal automática de 10 millones.",
      "El daño comercial inminente está acreditado por cartas de suspensión de dos cooperativas.",
      "Hubo extracción no autorizada de código con credenciales que la empresa no desactivó tras la desvinculación.",
      "El dato que lo cambia todo: el algoritmo tiene un margen de error verificado del 35% en condiciones de alta humedad. La gerencia lo sabía y publicitaba «99% de efectividad». Iniciar el litigio forzará un peritaje informático que expondrá el fraude comercial.",
    ],
    riesgosIA: [
      "Recomendar la demanda cautelar sin ponderar la prohibición constitucional de censura previa.",
      "Proponer medidas de secuestro digital desproporcionadas, ignorando el principio de proporcionalidad.",
      "Confundir normativa de defensa del consumidor para legitimar a Benítez como si fuera una asociación de usuarios.",
    ],
    hipotesis: [
      {
        id: "h1",
        titulo: "Mandato de prevención civil (art. 1711 CCyC)",
        texto:
          "La divulgación del código es antijurídica (violación del NDA), genera amenaza concreta de daño grave e irreparable sobre activos intangibles protegidos. La tutela inhibitoria es procedente.",
      },
      {
        id: "h2",
        titulo: "Excepción de incumplimiento contractual (art. 1031 CCyC)",
        texto:
          "La mora previa de AgroTech en pagar el bono justifica la suspensión del deber de secreto de Benítez. La confidencialidad cede ante el incumplimiento sustantivo de la empresa.",
      },
      {
        id: "h3",
        titulo: "Interés público agrícola (censura previa inconstitucional)",
        texto:
          "El pedido de remover publicaciones en LinkedIn es censura previa. La falla del 35% afecta la producción de alimentos y reviste interés público que desplaza el secreto industrial.",
      },
    ],
    documentos: [
      {
        id: "d1",
        titulo: "Convenio de Confidencialidad y No Competencia (NDA)",
        contenido:
          "Cláusula penal automática de 10 millones ante incumplimiento. Prohibición de divulgar código por cinco años. Fundamenta la antijuridicidad de la conducta de Benítez.",
        problema:
          "No especifica si la cláusula penal puede acumularse con indemnizaciones por lucro cesante real.",
      },
      {
        id: "d2",
        titulo: "Acta notarial de constatación de LinkedIn",
        contenido:
          "Constata el posteo de Benítez con fragmentos de código y el enlace de GitHub público. Prueba documental de la divulgación.",
        problema:
          "No acredita la integridad de la descarga de GitHub ni la autoría material directa (la cuenta pudo haber sido vulnerada).",
      },
      {
        id: "d3",
        titulo: "Correo interno del gerente técnico de AgroTech",
        contenido:
          "«El testeo en Santa Fe arrojó 35% de alertas erróneas. Vendimos el servicio publicitando 99% de efectividad. Si Benítez revela esto se nos cae la facturación.» Evidencia el fraude comercial conocido.",
        problema:
          "Si se incorpora al juicio demuestra mala fe de AgroTech e inhabilita la procedencia de la tutela inhibitoria.",
      },
      {
        id: "d4",
        titulo: "Carta documento de Benítez intimando el bono",
        contenido:
          "Fundamenta formalmente la mora contractual de AgroTech que habilita la excepción de incumplimiento.",
        problema:
          "Es una intimación laboral ante tribunales de trabajo, mientras el secreto tramita ante fueros civiles.",
      },
      {
        id: "d5",
        titulo: "Informe de auditoría de sistemas SafeData",
        contenido:
          "Registra accesos remotos no autorizados desde la IP de Benítez el día posterior a su desvinculación. Evidencia la sustracción de activos.",
        problema:
          "Carece de hashes criptográficos que verifiquen la integridad de los logs de auditoría de red.",
      },
    ],
    datoSorpresa:
      "Un competidor directo (BioSeed S.A.) comenzó a contactar a las cooperativas que suspendieron sus contratos, ofreciéndoles un servicio idéntico al de AgroTech, aparentemente usando el código que Benítez expuso en GitHub. El daño ya no es solo reputacional: hay un tercero apropiándose del activo.",
    cotioPrompt: `[CONTEXTO]: Sos consultor experto en derecho de daños y propiedad intelectual, con dominio de los arts. 1710 a 1713 del CCyC argentino.

[OBJETO]: Evaluar la viabilidad procesal y constitucional de una acción preventiva contra un exingeniero que publicó código fuente de la empresa.

[TAREA]: Determiná:
1. Si se configuran los requisitos de la tutela preventiva (antijuridicidad, amenaza de daño grave e inminente, causalidad adecuada).
2. Cómo influye la doctrina de censura previa en este caso.
3. Tres indicios probatorios críticos que la empresa debe aportar de inmediato.

[INPUT]: (pegá acá el relato inicial del cliente)

[OUTPUT]:
APARTADO I: Presupuestos de procedencia de la tutela inhibitoria (art. 1711 CCyC).
APARTADO II: Balance constitucional (propiedad industrial vs. libertad de expresión).
APARTADO III: Vulnerabilidad estratégica (riesgo de peritaje informático forzoso).
APARTADO IV: Datos que el abogado debe verificar antes de promover demanda.

// Importante: no generes borradores de escritos de demanda en esta etapa.`,
  },

  // ===================== CASO 3 — PENAL =====================
  {
    id: "penal",
    area: "Penal",
    emoji: "🔐",
    titulo: "Cripto-Fuga y Árbol Envenenado",
    caratula: "Austral Fintech S.R.L. c/ Mansilla",
    marcoNormativo:
      "Art. 173 inc. 7 CP (administración fraudulenta). Art. 18 CN (inviolabilidad de la correspondencia y el domicilio). Doctrina del árbol envenenado (frutos de prueba ilícita). Art. 59 inc. 6 CP (acuerdo restaurativo). Estándares de admisibilidad de evidencia digital y cadena de custodia informática.",
    objetivo:
      "Evaluar la tipicidad de una administración fraudulenta con criptoactivos y detectar que la prueba central del caso fue obtenida ilegalmente. El caso oculta dos trampas: los chats son inadmisibles por acceso sin orden judicial, y el PDF de auditoría fue manipulado con Photoshop.",
    relato:
      "Miren, doctores, denunciamos penalmente ya mismo a este delincuente o nos quedamos sin reservas para operar la semana que viene. Ramiro Mansilla era nuestro Director de Tecnología (CTO) en Austral Fintech S.R.L. El tipo tenía la custodia fiduciaria de las claves de acceso de nuestras billeteras cripto. Hace dos días descubrimos que desvió de forma unilateral ochenta mil dólares en criptomonedas USDT desde la cuenta fría de la empresa hacia billeteras virtuales externas. Cuando lo llamamos para que dé explicaciones, nos inventó que sufrió un hackeo. Pero nuestro gerente de sistemas se metió de forma remota en su notebook de la oficina y le pescó un archivo PDF que detalla las transferencias y chats de WhatsApp donde admite que le mandó esa plata a su hermano para pagar deudas de juego. Queremos que el fiscal ordene un allanamiento urgente de su casa, secuestre sus dispositivos y lo meta preso por administración fraudulenta.",
    ampliacion: [
      "Trampa 1: los directivos retuvieron físicamente a Mansilla durante tres horas bajo llave, le exigieron la contraseña de su celular personal y el técnico accedió remotamente a su WhatsApp personal sin orden judicial. Todo lo obtenido de esa laptop es inadmisible.",
      "Trampa 2: el PDF de auditoría tiene metadatos que revelan que fue editado con Adobe Photoshop con fecha posterior a la incautación de la laptop. La querella aportó una prueba falsificada.",
      "Lo que el blockchain sí acredita: las transacciones de 80.000 USDT existen y son públicas en Etherscan. La wallet de destino figura asociada a una sociedad offshore de Delaware cuyo único beneficiario es el hermano de Mansilla. Esa prueba es inmutable e independiente de los dispositivos incautados ilegalmente.",
    ],
    riesgosIA: [
      "Tratar las criptomonedas como dinero de curso legal y encuadrar el hecho como hurto simple en lugar de administración fraudulenta (art. 173 inc. 7 CP).",
      "Asumir que el acta notarial del escribano sanea el acceso no autorizado a WhatsApp personal.",
      "Proponer que la descentralización del blockchain impide el ejercicio de la acción penal territorial argentina.",
    ],
    hipotesis: [
      {
        id: "h1",
        titulo: "Administración fraudulenta (art. 173 inc. 7 CP)",
        texto:
          "Mansilla tenía la custodia fiduciaria del activo digital y desvió deliberadamente el patrimonio. Las transferencias de blockchain son prueba indiciaria suficiente de tipicidad objetiva, con independencia de los chats inadmisibles.",
      },
      {
        id: "h2",
        titulo: "Exclusión de evidencia digital ilegal (árbol envenenado)",
        texto:
          "El ingreso remoto sin orden judicial a la cuenta personal de WhatsApp viola el art. 18 CN. Todo lo obtenido de la laptop es nulo. La defensa solicita la exclusión total de esa prueba.",
      },
      {
        id: "h3",
        titulo: "Conflicto civil criminalizado indebidamente",
        texto:
          "Sin prueba lícita que acredite el dolo directo, la controversia debe tramitar ante el fuero civil y comercial. Corresponde el sobreseimiento penal.",
      },
    ],
    documentos: [
      {
        id: "d1",
        titulo: "Reporte interno de auditoría de sistemas",
        contenido:
          "Registra tres transferencias de USDT con credenciales del CTO Mansilla. Asocia la identidad informática del imputado al desvío.",
        problema:
          "Documento pre-redactado sin firma electrónica de auditoría. Solo tiene la fe de la empresa querellante.",
      },
      {
        id: "d2",
        titulo: "Acta notarial de incautación remota de la notebook",
        contenido:
          "El escribano constata los chats de WhatsApp Web: «Ya transferí los 80k USDT a la cuenta de mi hermano.» Intenta dotar de fe pública al hallazgo.",
        problema:
          "El escribano da fe de lo que ve en pantalla, pero no puede sanear la ilegalidad del acceso sin orden judicial.",
      },
      {
        id: "d3",
        titulo: "Metadatos del archivo Transferencias_Fintech.pdf",
        contenido:
          "Nombre, fecha de creación y última modificación. Datos técnicos del archivo de auditoría.",
        problema:
          "Los metadatos revelan que el archivo fue modificado con Adobe Photoshop CC el día posterior a la incautación. Destruye la confiabilidad de la querella y expone a los directivos a imputación por prueba falsificada.",
      },
      {
        id: "d4",
        titulo: "Cláusula del reglamento de uso de computadoras",
        contenido:
          "«Las computadoras son herramientas de uso exclusivo de trabajo. La empresa se reserva el derecho de auditar el contenido de los equipos en cualquier momento.»",
        problema:
          "El reglamento no fue suscripto individualmente por Mansilla. Sus términos amplios colisionan con el art. 18 CN sobre inviolabilidad de la correspondencia personal.",
      },
      {
        id: "d5",
        titulo: "Registro blockchain de Ethereum (Etherscan Export)",
        contenido:
          "Hash de transacción, bloque, dirección de origen y destino, valor, timestamp. Prueba inmutable y pública de las transferencias de USDT.",
        problema:
          "El registro no asocia directamente la wallet de destino con el nombre del hermano de Mansilla. Requiere exhorto a exchange registrado para vincular la identidad real.",
      },
    ],
    datoSorpresa:
      "Un informe externo revela que la billetera del hermano de Mansilla registra ingresos de criptomonedas canjeadas por pesos en un exchange local registrado ante la CNV. Esto permite al fiscal requerir medidas de embargo y trazabilidad por la vía de la regularización bancaria formal, sin depender de los chats viciados de nulidad.",
    cotioPrompt: `[CONTEXTO]: Sos abogado penalista experto en ciberdelitos corporativos y derecho penal económico argentino, con especialización en admisibilidad de evidencia digital.

[OBJETO]: Diagnóstico sobre la tipicidad penal del desvío de criptoactivos y la admisibilidad constitucional de la prueba aportada por la empresa querellante.

[TAREA]: Identificá:
1. Elementos del tipo penal de administración fraudulenta presentes u omitidos.
2. Nulidades constitucionales derivadas del acceso a comunicaciones privadas sin orden judicial.
3. Tres datos técnicos fácticos indispensables ausentes en la denuncia.
4. Alertas de alucinaciones al calificar el hecho como hurto informático.

[INPUT]: (pegá acá el relato inicial del cliente)

[OUTPUT]:
APARTADO I: Encuadre dogmático penal de la administración fraudulenta (art. 173 CP).
APARTADO II: Evaluación de admisibilidad constitucional de la evidencia digital.
APARTADO III: Vulnerabilidad estratégica (riesgo del árbol envenenado).
APARTADO IV: Cuestionario técnico de verificación humana previa a la querella.

// Importante: no redactes escritos formales de denuncia penal en esta etapa.`,
  },
];

export function getCaso(id: CasoId | null | undefined): Caso | null {
  return CASOS.find((c) => c.id === id) ?? null;
}

// --- Los cuatro momentos (versión simplificada para grupos grandes) ---
export interface MomentoDef {
  n: number;
  titulo: string;
  short: string;
  bajada: string;
}
export const MOMENTOS: MomentoDef[] = [
  { n: 1, titulo: "El caso", short: "Caso", bajada: "Elegí tu caso y leé qué te trae el cliente." },
  { n: 2, titulo: "Diagnosticá con IA", short: "Diagnóstico", bajada: "Usá la IA para ordenar el caso." },
  { n: 3, titulo: "La trampa", short: "La trampa", bajada: "Encontrá el error que la IA no ve." },
  { n: 4, titulo: "Tu decisión", short: "Decisión", bajada: "Decidí como abogado/a y descargá tu ficha." },
];

// --- Prompts listos para usar en el chat propio (un click) ---
// Híbrido: el alumno los abre directo, y puede verlos/editarlos para practicar COTIO.

const MINI_SYSTEM =
  "Actuás como consultor jurídico en derecho argentino dentro de una simulación pedagógica. " +
  "No resolvés el caso por mí ni redactás escritos completos: me ayudás a pensar y me hacés preguntas. " +
  "No inventás jurisprudencia; si no sabés si un fallo existe, lo decís.";

/** Momento 2 — diagnóstico. Reusa el prompt COTIO del caso con el relato ya inyectado. */
export function buildDiagnosticoPrompt(caso: Caso): string {
  return `${MINI_SYSTEM}\n\n${caso.cotioPrompt.replace(
    "(pegá acá el relato inicial del cliente)",
    caso.relato,
  )}`;
}

/** Momento 3 — auditoría de la prueba (la trampa). */
export function buildAuditoriaPrompt(caso: Caso): string {
  const docs = caso.documentos
    .map((d, i) => `${i + 1}. ${d.titulo}: ${d.contenido}`)
    .join("\n");
  return `${MINI_SYSTEM}

[CASO]: ${caso.titulo} — ${caso.caratula}.

[PRUEBA QUE APORTA EL CLIENTE]:
${docs}

[DATO NUEVO QUE APARECIÓ]:
${caso.datoSorpresa}

[TAREA]: Auditá esta prueba como lo haría un abogado prudente.
1. Para cada elemento, decime si tiene problemas de admisibilidad, integridad o validez.
2. Marcá qué NO debería afirmar en un escrito sin antes verificarlo.
3. Señalá si vos mismo (la IA) estás por cometer algún error típico (citar normas derogadas, dar por buena prueba digital sin respaldo, etc.).

No redactes la demanda. Solo el análisis crítico.`;
}

// --- Ficha de decisión jurídica asistida (entregable, momento 4 — corta) ---
export interface FichaCampo {
  key: keyof FichaData;
  label: string;
  hint: string;
}
export interface FichaData {
  argFavor: string;
  sugerenciaDescartada: string;
  decisionHumana: string;
}
export const FICHA_CAMPOS: FichaCampo[] = [
  {
    key: "argFavor",
    label: "Tu mejor argumento a favor",
    hint: "El argumento más fuerte que sostiene tu posición.",
  },
  {
    key: "sugerenciaDescartada",
    label: "Una sugerencia de la IA que NO seguís (y por qué)",
    hint: "Algo que la IA te recomendó y vos descartás con criterio propio.",
  },
  {
    key: "decisionHumana",
    label: "Tu decisión final como abogado/a",
    hint: "¿Qué hacés con este caso? En una o dos frases.",
  },
];

// --- Estado per-participante (se guarda como una respuesta única) ---
export const EXP_ACTIVITY = "expediente";
export const EXP_ITEM = "state";

export interface ExpedienteState {
  caso: CasoId | null;
  momento: number; // momento máximo alcanzado (1..4)
  diagnosticoNota: string; // M2: una línea de lo que la IA ayudó a ver
  alucinaciones: string[]; // M3: índices de riesgosIA detectados
  alucinacionPorque: string; // M3: por qué no le haría caso
  estrategia: string; // M4: id de la hipótesis elegida
  ficha: FichaData; // M4
  completado: boolean;
}

export function emptyState(): ExpedienteState {
  return {
    caso: null,
    momento: 1,
    diagnosticoNota: "",
    alucinaciones: [],
    alucinacionPorque: "",
    estrategia: "",
    ficha: { argFavor: "", sugerenciaDescartada: "", decisionHumana: "" },
    completado: false,
  };
}
