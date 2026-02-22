"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10b981",
  anthropic: "#d97706",
  perplexity: "#8b5cf6",
  gemini: "#3b82f6",
};

interface ProviderScore {
  provider: string;
  mentionRate: number;
}

export function ProviderComparison({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<ProviderScore[]>([]);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/dashboard`)
      .then((r) => r.json())
      .then((res) => {
        const byProvider = new Map<string, number[]>();
        for (const score of res.scores) {
          if (score.provider && !score.isCompetitor) {
            const existing = byProvider.get(score.provider) ?? [];
            existing.push(score.mentionRate);
            byProvider.set(score.provider, existing);
          }
        }
        const chartData = Array.from(byProvider.entries()).map(([provider, rates]) => ({
          provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          mentionRate: rates.reduce((a, b) => a + b, 0) / rates.length,
        }));
        setData(chartData);
      });
  }, [workspaceId]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold mb-4">Visibility by AI Provider</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <XAxis dataKey="provider" stroke="#71717a" fontSize={12} />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px" }}
            formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`}
          />
          <Bar dataKey="mentionRate" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.provider} fill={PROVIDER_COLORS[entry.provider.toLowerCase()] ?? "#3b82f6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
