"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { formatDistanceToNow } from "date-fns";

interface Mention {
  brandName: string;
  mentioned: boolean;
  sentiment: string;
  context: string;
  recommended: boolean;
  provider: string;
  executedAt: string;
}

export function MentionFeed({ workspaceId }: { workspaceId: string }) {
  const [mentions, setMentions] = useState<Mention[]>([]);

  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/dashboard`)
      .then((r) => r.json())
      .then((res) => setMentions(res.recentMentions));
  }, [workspaceId]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Mentions</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {mentions.length === 0 && (
            <p className="text-sm text-zinc-500">No mentions yet. Run an analysis first.</p>
          )}
          {mentions.map((mention, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-lg bg-zinc-950 p-4"
            >
              <SentimentDot sentiment={mention.sentiment} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{mention.brandName}</span>
                  <ProviderBadge provider={mention.provider} />
                  {mention.recommended && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{mention.context}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {formatDistanceToNow(new Date(mention.executedAt), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SentimentDot({ sentiment }: { sentiment: string }) {
  const color = sentiment === "positive" ? "bg-emerald-500" : sentiment === "negative" ? "bg-red-500" : "bg-zinc-500";
  return <div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${color} shrink-0`} />;
}

function ProviderBadge({ provider }: { provider: string }) {
  return (
    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
      {provider}
    </span>
  );
}
