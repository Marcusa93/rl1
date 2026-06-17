# RL1 · Taller IA Abogacía — Aula en vivo

Webapp para dictar clases interactivas: el **docente activa actividades en vivo** y los
**participantes responden desde su celular**, mientras el **proyector** muestra los resultados
agregados en tiempo real. Construida sobre la estructura del proyecto SDE-IA, con front propio en
la identidad de RL1.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind 4 · Supabase (Postgres) · OpenRouter.

## Flujo de la clase (Taller IA Abogacía)

1. **Diagnóstico inicial** — tarjetas: cada uno marca qué tareas jurídicas ya hizo con IA → gráfico en vivo para leer al grupo.
2. **Cómo funciona la IA generativa** — tokens + alucinación, con un **Verdadero/Falso** para consolidar y debatir (el docente avanza y revela).
3. **Método COTIO + optimizador** — el participante escribe un prompt y el **optimizador lo analiza variable por variable** (Contexto, Objetivo, Tarea, Input, Output).
4. **Demanda laboral: sin método vs COTIO** — genera los dos resultados lado a lado; con COTIO suma un **checklist de verificación** (cierra el círculo con la alucinación).
5. **Confidencialidad** — integrada al flujo: el optimizador alerta si detecta datos reales/sensibles en el prompt.
6. **Tarea bisagra** — cada uno se compromete a usar la herramienta en un caso real y traer prompt + output a la Clase 2 (queda registrado como material de arranque).

## Rutas (sin códigos — una sola clase fija)

| Ruta | Para |
|------|------|
| `/` | Participante: entra, pone su nombre y ve la actividad activa |
| `/profesor` | Docente: clave + panel de control en vivo |
| `/pantalla` | Pantalla para proyectar |

La sesión por defecto se auto-crea la primera vez que alguien entra; no hay que crear ni compartir códigos.

## Puesta en marcha

```bash
pnpm install
cp .env.local.example .env.local   # completar credenciales
# aplicar el esquema de la base:
#   Supabase → SQL Editor → pegar supabase/schema.sql → Run
#   (o)  node scripts/apply-schema.mjs "postgresql://...connection string..."
node --env-file=.env.local scripts/smoke.mjs   # verifica conexión + tablas
pnpm dev
```

### Variables de entorno (`.env.local`)

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API
- `OPENROUTER_API_KEY` — habilita el optimizador COTIO y el comparador de demanda
- `OPENROUTER_MODEL` — por defecto `anthropic/claude-sonnet-4.6`
- `TEACHER_PASSWORD` — clave del panel docente (default `rl1-docente`)

## Cómo dar la clase

1. Entrá a `/profesor`, ingresá la clave.
2. Abrí `/pantalla` en el proyector. Compartí a los alumnos el link de la app (la raíz `/`).
3. Los participantes entran por `/`, ponen su nombre y listo (sin códigos).
4. Desde el panel, **activá cada actividad** en orden. Todo se actualiza solo en los celulares y en el proyector.
