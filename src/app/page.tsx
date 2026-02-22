"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const workspace = await res.json();
    router.push(`/dashboard/${workspace.id}/setup`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">GEO Analyzer</h1>
          <p className="text-zinc-400 mt-2">Track how your brand appears in AI-generated search results.</p>
        </div>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Workspace name (e.g. My Brand)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg px-4 py-3 font-medium text-sm transition-colors"
          >
            {loading ? "Creating..." : "Get Started"}
          </button>
        </div>
      </div>
    </div>
  );
}
