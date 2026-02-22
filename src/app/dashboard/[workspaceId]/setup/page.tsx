"use client";

import { useState, useEffect, use } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";

export default function SetupPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const [brands, setBrands] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<{ success: number; failed: number } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/workspaces/${workspaceId}/brands`).then((r) => r.json()),
      fetch(`/api/workspaces/${workspaceId}/queries`).then((r) => r.json()),
    ]).then(([b, q]) => {
      setBrands(b);
      setQueries(q);
    });
  }, [workspaceId]);

  const runAnalysis = async () => {
    setIsRunning(true);
    setRunResults(null);
    setRunError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/run`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        setRunError(`Server error: ${text}`);
        return;
      }
      const data = await res.json();
      const success = data.results.filter((r: any) => r.success).length;
      const failed = data.results.filter((r: any) => !r.success).length;
      setRunResults({ success, failed });
    } catch (e: any) {
      setRunError(e.message ?? "Unknown error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Setup</h1>
        <p className="text-zinc-400 mt-1">Configure your brands and search queries to monitor.</p>
      </div>

      {/* Brands Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Brands</h2>
          <AddBrandDialog workspaceId={workspaceId} onAdd={(b) => setBrands([...brands, b])} />
        </div>
        <div className="space-y-2">
          {brands.length === 0 && (
            <p className="text-sm text-zinc-500">No brands added yet.</p>
          )}
          {brands.map((brand) => (
            <div key={brand.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <p className="font-medium">{brand.name}</p>
                <p className="text-sm text-zinc-500">{brand.domain ?? "No domain"} · {brand.category ?? "Uncategorized"}</p>
              </div>
              {brand.isCompetitor && (
                <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Competitor</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Queries Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Search Queries</h2>
          <AddQueryDialog workspaceId={workspaceId} onAdd={(q) => setQueries([...queries, q])} />
        </div>
        <div className="space-y-2">
          {queries.length === 0 && (
            <p className="text-sm text-zinc-500">No queries added yet.</p>
          )}
          {queries.map((query) => (
            <div key={query.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="font-medium">&ldquo;{query.query}&rdquo;</p>
              <p className="text-sm text-zinc-500">{query.category ?? "Uncategorized"}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Run Button */}
      <div className="space-y-3">
        <button
          onClick={runAnalysis}
          disabled={isRunning || brands.length === 0 || queries.length === 0}
          className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-3 font-medium transition-colors"
        >
          {isRunning ? "Running Analysis... (this may take ~30 seconds)" : "Run Analysis Now"}
        </button>

        {runError && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-sm text-red-400 font-medium">Analysis failed</p>
            <p className="text-sm text-red-300 mt-1">{runError}</p>
          </div>
        )}

        {runResults && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
            <p className="text-sm text-emerald-400 font-medium">
              Analysis complete — {runResults.success} succeeded{runResults.failed > 0 ? `, ${runResults.failed} failed` : ""}
            </p>
            <Link
              href={`/dashboard/${workspaceId}`}
              className="block text-center w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-medium transition-colors"
            >
              View Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AddBrandDialog({ workspaceId, onAdd }: { workspaceId: string; onAdd: (b: any) => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [category, setCategory] = useState("");
  const [isCompetitor, setIsCompetitor] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    const res = await fetch(`/api/workspaces/${workspaceId}/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain, category, isCompetitor }),
    });
    const brand = await res.json();
    onAdd(brand);
    setOpen(false);
    setName("");
    setDomain("");
    setCategory("");
    setIsCompetitor(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
          + Add Brand
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-lg font-semibold">Add Brand</Dialog.Title>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm" />
          <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domain (optional)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm" />
          <label className="flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={isCompetitor} onChange={(e) => setIsCompetitor(e.target.checked)} />
            This is a competitor
          </label>
          <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
            Add Brand
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AddQueryDialog({ workspaceId, onAdd }: { workspaceId: string; onAdd: (q: any) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    const res = await fetch(`/api/workspaces/${workspaceId}/queries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, category }),
    });
    const q = await res.json();
    onAdd(q);
    setOpen(false);
    setQuery("");
    setCategory("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors">
          + Add Query
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md space-y-4">
          <Dialog.Title className="text-lg font-semibold">Add Search Query</Dialog.Title>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder='e.g. "best running shoes for flat feet"' className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm" />
          <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors">
            Add Query
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
