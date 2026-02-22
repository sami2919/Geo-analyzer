"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrendPoint {
  date: string;
  mentionRate: number;
  competitorAvg: number;
}

export function TrendChart({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<TrendPoint[]>([]);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/trends`)
      .then((r) => r.json())
      .then(setData);
  }, [workspaceId]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold mb-4">Visibility Over Time</h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Legend />
          <Line type="monotone" dataKey="mentionRate" stroke="#3b82f6" name="Your Brand" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="competitorAvg" stroke="#71717a" name="Competitor Avg" strokeWidth={2} dot={false} strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
