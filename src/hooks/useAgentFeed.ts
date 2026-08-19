import { useEffect, useRef, useState } from "react";
import type { Alert } from "../agents/types";
import { SEVERITY_ORDER } from "../agents/types";
import { fetchEarthquakeAlerts } from "../agents/earthquakeAgent";
import { fetchFloodAlerts } from "../agents/floodAgent";
import { fetchWildfireAlerts } from "../agents/wildfireAgent";
import { fetchReliefAlerts } from "../agents/reliefAgent";

const POLL_INTERVAL_MS = 3 * 60 * 1000;

export function useAgentFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function refresh() {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      fetchEarthquakeAlerts(),
      fetchFloodAlerts(),
      fetchWildfireAlerts(),
    ]);

    if (id !== requestId.current) return;

    const hazardAlerts = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const failures = results.filter((r) => r.status === "rejected");

    let reliefAlerts: Alert[] = [];
    try {
      reliefAlerts = await fetchReliefAlerts(hazardAlerts);
    } catch {
      // Relief agent failure shouldn't blank out the real hazard data already fetched.
    }

    if (id !== requestId.current) return;

    const combined = [...hazardAlerts, ...reliefAlerts].sort(
      (a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]
    );

    setAlerts(combined);
    setError(
      failures.length > 0
        ? `${failures.length} of 3 hazard feeds failed to load — showing partial data.`
        : null
    );
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { alerts, loading, error, refresh };
}
