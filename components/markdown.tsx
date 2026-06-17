import { Fragment } from "react";

/** Render mínimo de markdown: ##, ###, listas con "-", **negrita**. Suficiente para los textos del taller. */
export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];

  const flush = (key: string) => {
    if (!list.length) return;
    out.push(
      <ul key={key} className="my-2 list-disc space-y-1 pl-5 text-sm text-muted">
        {list.map((li, i) => (
          <li key={i}>{inline(li)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flush(`f${i}`);
      out.push(
        <h4 key={i} className="mt-4 text-sm font-bold uppercase tracking-wide text-teal">
          {inline(line.slice(4))}
        </h4>,
      );
    } else if (line.startsWith("## ")) {
      flush(`f${i}`);
      out.push(
        <h3 key={i} className="mb-1 text-lg font-bold">
          {inline(line.slice(3))}
        </h3>,
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line.trim() === "") {
      flush(`f${i}`);
    } else {
      flush(`f${i}`);
      out.push(
        <p key={i} className="my-1 text-sm text-muted">
          {inline(line)}
        </p>,
      );
    }
  });
  flush("end");
  return <div>{out}</div>;
}

function inline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-foreground">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}
