import { X, Info } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip } from "recharts";
import type { Alert } from "../agents/types";
import { SEVERITY_COLOR } from "../agents/types";

interface AlertDetailProps {
  alert: Alert;
  onClose: () => void;
}

export function AlertDetail({ alert, onClose }: AlertDetailProps) {
  const color = SEVERITY_COLOR[alert.severity];

  return (
    <div className="border-t border-white/10 p-4 space-y-4 bg-black/40">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold">{alert.title}</h3>
          <p className="text-xs text-gray-500">{alert.location}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg" aria-label="Close">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
          <Info className="w-3 h-3" />
          Why this was triggered
        </div>
        <ul className="space-y-1">
          {alert.reasoning.map((point, i) => (
            <li key={i} className="text-xs text-gray-300 pl-3 border-l-2" style={{ borderColor: color }}>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {alert.detail && (
        <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
          {alert.detail}
        </div>
      )}

      {alert.trend && alert.trend.points.length > 1 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            {alert.trend.label} ({alert.trend.unit})
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alert.trend.points}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <ChartTooltip
                  contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11 }}
                  labelFormatter={(t) => new Date(t as string).toLocaleString()}
                />
                <Area type="monotone" dataKey="value" stroke={color} fill="url(#trendFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono pt-2 border-t border-white/5">
        <span>SOURCE: {alert.source}</span>
        <span>{new Date(alert.triggeredAt).toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
