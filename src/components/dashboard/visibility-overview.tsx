"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface DashboardData {
  scores: Array<{
    brandName: string;
    mentionRate: number;
    avgPosition: number;
    sentimentScore: number;
    recommendationRate: number;
    isCompetitor: boolean;
  }>;
}

export function VisibilityOverview({ workspaceId }: { workspaceId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/dashboard`)
      .then((r) => r.json())
      .then(setData);
  }, [workspaceId]);

  if (!data) return <LoadingSkeleton />;

  const primaryScores = data.scores.filter((s) => !s.isCompetitor);
  const avgMentionRate = average(primaryScores.map((s) => s.mentionRate));
  const avgSentiment = average(primaryScores.map((s) => s.sentimentScore));
  const avgPosition = average(primaryScores.map((s) => s.avgPosition));
  const avgRecommendation = average(primaryScores.map((s) => s.recommendationRate));

  const cards = [
    { label: "Mention Rate", value: `${(avgMentionRate * 100).toFixed(1)}%`, description: "% of queries where your brand appears" },
    { label: "Avg Position", value: avgPosition?.toFixed(1) ?? "—", description: "Average ranking when mentioned" },
    { label: "Sentiment", value: formatSentiment(avgSentiment), description: "Overall tone of mentions" },
    { label: "Recommendation Rate", value: `${(avgRecommendation * 100).toFixed(1)}%`, description: "% of queries with explicit recommendation" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        >
          <p className="text-sm text-zinc-400">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          <p className="mt-1 text-xs text-zinc-500">{card.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatSentiment(score: number): string {
  if (score > 0.3) return "Positive";
  if (score < -0.3) return "Negative";
  return "Neutral";
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 animate-pulse">
          <div className="h-4 bg-zinc-800 rounded w-24" />
          <div className="h-8 bg-zinc-800 rounded w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}
