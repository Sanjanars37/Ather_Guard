import { Waves, Flame, Mountain, Truck, RefreshCw } from "lucide-react";
import { cn } from "../lib/utils";
import type { Alert, Hazard } from "../agents/types";

const HAZARD_ICON: Record<Hazard, typeof Waves> = {
  earthquake: Mountain,
  flood: Waves,
  wildfire: Flame,
  relief: Truck,
};

const SEVERITY_BADGE: Record<Alert["severity"], string> = {
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

interface AlertFeedProps {
  alerts: Alert[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}

export function AlertFeed({ alerts, selectedId, loading, error, onSelect, onRefresh }: AlertFeedProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
          XAI Alert Feed
        </h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
          aria-label="Refresh alerts"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 text-gray-500", loading && "animate-spin")} />
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-2 text-[11px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
        {alerts.length === 0 && !loading && (
          <p className="px-4 py-8 text-center text-xs text-gray-600">
            No active hazard alerts right now.
          </p>
        )}
        {alerts.map((alert) => {
          const Icon = HAZARD_ICON[alert.hazard];
          const isSelected = alert.id === selectedId;
          return (
            <button
              key={alert.id}
              onClick={() => onSelect(alert.id)}
              className={cn(
                "w-full text-left px-4 py-3 transition-colors flex gap-3 items-start",
                isSelected ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate">{alert.title}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{alert.location}</p>
                <span
                  className={cn(
                    "inline-block mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                    SEVERITY_BADGE[alert.severity]
                  )}
                >
                  {alert.severity}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
