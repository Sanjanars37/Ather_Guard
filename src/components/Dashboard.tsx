import { useMemo, useState } from "react";
import { ShieldAlert, Map as MapIcon, HeartPulse } from "lucide-react";
import { cn } from "../lib/utils";
import { useAgentFeed } from "../hooks/useAgentFeed";
import { TacticalMap } from "./TacticalMap";
import { AlertFeed } from "./AlertFeed";
import { AlertDetail } from "./AlertDetail";
import { SurvivalOrchestrator } from "./SurvivalOrchestrator";

type Tab = "alerts" | "survival";

export function Dashboard() {
  const { alerts, loading, error, refresh } = useAgentFeed();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("alerts");

  const selectedAlert = useMemo(
    () => alerts.find((a) => a.id === selectedId) ?? null,
    [alerts, selectedId]
  );

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="h-screen w-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
          <span className="font-bold tracking-tight uppercase text-sm">AetherGuard</span>
          <span className="hidden sm:inline text-[10px] text-gray-500 uppercase tracking-widest">
            Multi-Agent Disaster Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
          {criticalCount > 0 && (
            <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full uppercase tracking-widest">
              {criticalCount} Critical
            </span>
          )}
          <span>{alerts.length} Active Alerts</span>
        </div>
      </header>

      <main className="flex-1 flex min-h-0">
        <div className="flex-1 min-w-0">
          <TacticalMap alerts={alerts} selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <div className="w-full max-w-sm border-l border-white/10 bg-black/40 flex flex-col min-h-0">
          <div className="flex border-b border-white/10 shrink-0">
            <TabButton icon={MapIcon} label="Alerts" active={tab === "alerts"} onClick={() => setTab("alerts")} />
            <TabButton
              icon={HeartPulse}
              label="Survival Plan"
              active={tab === "survival"}
              onClick={() => setTab("survival")}
            />
          </div>

          {tab === "alerts" ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto">
                <AlertFeed
                  alerts={alerts}
                  selectedId={selectedId}
                  loading={loading}
                  error={error}
                  onSelect={setSelectedId}
                  onRefresh={refresh}
                />
              </div>
              {selectedAlert && (
                <div className="shrink-0 max-h-[45vh] overflow-y-auto">
                  <AlertDetail alert={selectedAlert} onClose={() => setSelectedId(null)} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <SurvivalOrchestrator prefill={selectedAlert} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof MapIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors",
        active ? "text-white border-b-2 border-blue-500" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
