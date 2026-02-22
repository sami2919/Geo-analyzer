"use client";

import { useEffect, useState } from "react";

interface BrandScore {
  brandName: string;
  isCompetitor: boolean;
  mentionRate: number;
  avgPosition: number | null;
  sentimentScore: number | null;
  recommendationRate: number | null;
}

export function BrandRankings({ workspaceId }: { workspaceId: string }) {
  const [brands, setBrands] = useState<BrandScore[]>([]);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/dashboard`)
      .then((r) => r.json())
      .then((res) => {
        // Deduplicate by brand name, keeping the latest score
        const seen = new Map<string, BrandScore>();
        for (const score of res.scores) {
          if (!seen.has(score.brandName)) {
            seen.set(score.brandName, score);
          }
        }
        const sorted = Array.from(seen.values()).sort(
          (a, b) => b.mentionRate - a.mentionRate
        );
        setBrands(sorted);
      });
  }, [workspaceId]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold mb-4">Brand Rankings</h2>
      <div className="space-y-2">
        {brands.length === 0 && (
          <p className="text-sm text-zinc-500">No data yet. Run an analysis first.</p>
        )}
        {brands.map((brand, i) => (
          <div
            key={brand.brandName}
            className="flex items-center justify-between rounded-lg bg-zinc-950 p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-zinc-500 w-6">#{i + 1}</span>
              <div>
                <span className="text-sm font-medium">{brand.brandName}</span>
                {brand.isCompetitor && (
                  <span className="ml-2 text-xs text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                    Competitor
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <p className="text-zinc-400 text-xs">Mention</p>
                <p className="font-medium">{(brand.mentionRate * 100).toFixed(0)}%</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-400 text-xs">Position</p>
                <p className="font-medium">{brand.avgPosition?.toFixed(1) ?? "—"}</p>
              </div>
              <SentimentIndicator score={brand.sentimentScore} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SentimentIndicator({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score > 0.3 ? "text-emerald-400" : score < -0.3 ? "text-red-400" : "text-zinc-400";
  const label = score > 0.3 ? "Positive" : score < -0.3 ? "Negative" : "Neutral";
  return (
    <div className="text-right">
      <p className="text-zinc-400 text-xs">Sentiment</p>
      <p className={`font-medium text-xs ${color}`}>{label}</p>
    </div>
  );
}
