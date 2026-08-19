import { useEffect, useRef, useState } from "react";
import { Search, Mountain, Waves, Flame, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";
import { geocodeLocation } from "../agents/geocode";
import type { GeocodeResult } from "../agents/geocode";
import { fetchRegionalSeismicActivity } from "../agents/earthquakeAgent";
import type { RegionalSeismicActivity } from "../agents/earthquakeAgent";
import { fetchFloodRiskForPoints } from "../agents/floodAgent";
import { fetchWildfireRiskForPoints } from "../agents/wildfireAgent";
import type { Alert, Severity } from "../agents/types";
import { SEVERITY_COLOR } from "../agents/types";

const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

interface ScanResult {
  place: GeocodeResult;
  seismic: RegionalSeismicActivity;
  flood: Alert | null;
  wildfire: Alert | null;
}

export function RegionalScanner() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await geocodeLocation(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const scan = async (place: GeocodeResult) => {
    setShowSuggestions(false);
    setQuery(`${place.name}${place.country ? `, ${place.country}` : ""}`);
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const point = { name: place.name, lat: place.lat, lon: place.lon };
      const [seismic, floodAlerts, wildfireAlerts] = await Promise.all([
        fetchRegionalSeismicActivity(place.lat, place.lon),
        fetchFloodRiskForPoints([point]),
        fetchWildfireRiskForPoints([point]),
      ]);

      setResult({
        place,
        seismic,
        flood: floodAlerts[0] ?? null,
        wildfire: wildfireAlerts[0] ?? null,
      });
    } catch (err: any) {
      setError(err.message || "Failed to scan this location.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="relative">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Type a city or region..."
            className="flex-1 bg-transparent text-xs text-gray-300 focus:outline-none"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[#141414] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => scan(s)}
                className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-white/10 transition-colors"
              >
                {s.name}
                {s.admin1 ? `, ${s.admin1}` : ""}
                {s.country ? `, ${s.country}` : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      {scanning && (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Scanning live hazard data...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-tight">{error}</p>
        </div>
      )}

      {result && !scanning && (
        <div className="space-y-3">
          <ScanCard
            icon={Mountain}
            title="Seismic Activity"
            severity={result.seismic.severity}
            lines={
              result.seismic.count === 0
                ? [`No M2.5+ earthquakes recorded within ${result.seismic.radiusKm} km in the last 30 days.`]
                : [
                    `${result.seismic.count} earthquake${result.seismic.count > 1 ? "s" : ""} (M2.5+) within ${result.seismic.radiusKm} km in the last 30 days`,
                    `Largest: M${result.seismic.maxMagnitude?.toFixed(1)} — ${result.seismic.recentQuakes[0]?.place}`,
                  ]
            }
          />
          <ScanCard
            icon={Waves}
            title="Flood Risk"
            severity={result.flood?.severity ?? "low"}
            lines={
              result.flood
                ? result.flood.reasoning
                : ["No nearby river discharge data available for this exact point."]
            }
          />
          <ScanCard
            icon={Flame}
            title="Wildfire Risk"
            severity={result.wildfire?.severity ?? "low"}
            lines={
              result.wildfire
                ? result.wildfire.reasoning
                : ["Current weather conditions are within normal fire-risk range."]
            }
          />
        </div>
      )}
    </div>
  );
}

function ScanCard({
  icon: Icon,
  title,
  severity,
  lines,
}: {
  icon: typeof Mountain;
  title: string;
  severity: Severity;
  lines: string[];
}) {
  const color = SEVERITY_COLOR[severity];
  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold">{title}</span>
        </div>
        <span
          className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border")}
          style={{ color, borderColor: `${color}40`, backgroundColor: `${color}1a` }}
        >
          {SEVERITY_LABEL[severity]}
        </span>
      </div>
      <ul className="space-y-1">
        {lines.map((line, i) => (
          <li key={i} className="text-xs text-gray-400 pl-3 border-l-2" style={{ borderColor: color }}>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
