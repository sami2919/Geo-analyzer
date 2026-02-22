import { VisibilityOverview } from "@/components/dashboard/visibility-overview";
import { ProviderComparison } from "@/components/dashboard/provider-comparison";
import { MentionFeed } from "@/components/dashboard/mention-feed";
import { BrandRankings } from "@/components/dashboard/brand-rankings";
import { TrendChart } from "@/components/dashboard/trend-chart";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">GEO Analyzer</h1>
        <p className="text-sm text-zinc-400">AI Search Visibility Dashboard</p>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Top-level KPI cards */}
        <VisibilityOverview workspaceId={workspaceId} />

        {/* Visibility trend over time */}
        <TrendChart workspaceId={workspaceId} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Side-by-side provider comparison */}
          <ProviderComparison workspaceId={workspaceId} />

          {/* Brand ranking table */}
          <BrandRankings workspaceId={workspaceId} />
        </div>

        {/* Live mention feed */}
        <MentionFeed workspaceId={workspaceId} />
      </main>
    </div>
  );
}
