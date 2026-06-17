"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Polling liviano: refresca un endpoint cada `interval` ms. */
export function useLive<T>(url: string | null, interval = 2000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const active = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!active.current) return;
      if (!res.ok) setError(json.error || "Error");
      else {
        setData(json);
        setError(null);
      }
    } catch (e) {
      if (active.current) setError((e as Error).message);
    } finally {
      if (active.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    active.current = true;
    fetchOnce();
    const id = setInterval(fetchOnce, interval);
    return () => {
      active.current = false;
      clearInterval(id);
    };
  }, [fetchOnce, interval]);

  return { data, error, loading, refresh: fetchOnce };
}
