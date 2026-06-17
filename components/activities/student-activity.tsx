"use client";

import type { ParticipantRow, SessionRow } from "@/lib/types";
import { WaitingRoom } from "./waiting-room";
import { Encuesta } from "./encuesta";
import { Diagnostico } from "./diagnostico";
import { VerdaderoFalso } from "./verdadero-falso";
import { Cotio } from "./cotio";
import { Chat } from "./chat";
import { Caso } from "./caso";
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
    case "encuesta":
      return <Encuesta {...props} />;
    case "diagnostico":
      return <Diagnostico {...props} />;
    case "verdadero_falso":
      return <VerdaderoFalso {...props} />;
    case "cotio":
      return <Cotio {...props} />;
    case "chat":
      return <Chat {...props} />;
    case "caso":
      return <Caso {...props} />;
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
