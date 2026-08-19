import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LocateFixed, Siren, HeartPulse, Backpack, Radio, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Alert, Hazard, Severity } from "../agents/types";
import { cn } from "../lib/utils";

const HAZARDS: { value: Hazard; label: string }[] = [
  { value: "earthquake", label: "Earthquake" },
  { value: "flood", label: "Flood" },
  { value: "wildfire", label: "Wildfire" },
];

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

interface SurvivalPlan {
  immediateSteps: string[];
  firstAid: string[];
  goBag: string[];
  communication: string[];
}

interface SurvivalOrchestratorProps {
  prefill: Alert | null;
}

export function SurvivalOrchestrator({ prefill }: SurvivalOrchestratorProps) {
  const [hazard, setHazard] = useState<Hazard>("earthquake");
  const [severity, setSeverity] = useState<Severity>("high");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<SurvivalPlan | null>(null);

  useEffect(() => {
    if (!prefill || prefill.hazard === "relief") return;
    setHazard(prefill.hazard);
    setSeverity(prefill.severity);
    setLocation(prefill.location);
    setCoords({ lat: prefill.lat, lon: prefill.lon });
    setPlan(null);
  }, [prefill]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation isn't available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => toast.error("Couldn't get your location — check browser permissions.")
    );
  };

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/survival-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hazard, severity, location: location || "Unspecified location", coords }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate survival plan.");
      setPlan(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate survival plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={hazard}
          onChange={(e) => setHazard(e.target.value as Hazard)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300"
        >
          {HAZARDS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300"
        >
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        <button
          onClick={useMyLocation}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Use my location"
        >
          <LocateFixed className="w-4 h-4 text-blue-400" />
        </button>
      </div>

      <button
        onClick={generatePlan}
        disabled={loading}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
          loading ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200 active:scale-[0.98]"
        )}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> Generating Plan...
          </>
        ) : (
          "Generate Survival Plan"
        )}
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 leading-tight">{error}</p>
        </div>
      )}

      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <PlanSection icon={Siren} title="Immediate Escape Steps" items={plan.immediateSteps} />
            <PlanSection icon={HeartPulse} title="First-Aid & Triage" items={plan.firstAid} />
            <PlanSection icon={Backpack} title="Go-Bag Checklist" items={plan.goBag} />
            <PlanSection icon={Radio} title="Communication & Rescue" items={plan.communication} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanSection({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Siren;
  title: string;
  items: string[];
}) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
        <Icon className="w-3.5 h-3.5" />
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-gray-300 pl-3 border-l-2 border-blue-500/40">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
