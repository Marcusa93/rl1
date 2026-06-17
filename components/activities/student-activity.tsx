"use client";

import type { ParticipantRow, SessionRow } from "@/lib/types";
import { WaitingRoom } from "./waiting-room";
import { Diagnostico } from "./diagnostico";
import { VerdaderoFalso } from "./verdadero-falso";
import { Cotio } from "./cotio";
import { Demanda } from "./demanda";
import { Tarea } from "./tarea";

export function StudentActivity({
  slug,
  session,
  me,
}: {
  slug: string;
  session: SessionRow;
  me: ParticipantRow;
}) {
  const props = { slug, session, me };
  switch (session.current_activity) {
    case "diagnostico":
      return <Diagnostico {...props} />;
    case "verdadero_falso":
      return <VerdaderoFalso {...props} />;
    case "cotio":
      return <Cotio {...props} />;
    case "demanda":
      return <Demanda {...props} />;
    case "tarea":
      return <Tarea {...props} />;
    default:
      return <WaitingRoom name={me.name} />;
  }
}

export interface ActivityProps {
  slug: string;
  session: SessionRow;
  me: ParticipantRow;
}
