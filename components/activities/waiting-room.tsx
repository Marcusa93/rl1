"use client";

import { LogoRL1 } from "@/components/brand/logo-rl1";

export function WaitingRoom({ name }: { name: string }) {
  return (
    <div className="rise flex flex-col items-center justify-center py-20 text-center">
      <div className="pulse-ring mb-6 rounded-full p-1">
        <LogoRL1 size={48} wordmark={false} />
      </div>
      <h2 className="text-xl font-semibold">¡Listo, {name.split(" ")[0]}! 🎉</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Estás dentro del aula. Esperá a que el docente active la primera actividad — va a aparecer
        acá automáticamente.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-faint">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        Conectado
      </div>
    </div>
  );
}
