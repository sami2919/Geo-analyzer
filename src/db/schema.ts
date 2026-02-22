import { pgTable, uuid, text, timestamp, integer, real, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const aiProviderEnum = pgEnum("ai_provider", ["openai", "anthropic", "perplexity", "gemini"]);
export const sentimentEnum = pgEnum("sentiment", ["positive", "neutral", "negative"]);

// A workspace/account that tracks brands
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Brands being tracked
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  domain: text("domain"),
  category: text("category"),
  isCompetitor: boolean("is_competitor").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Consumer search queries to monitor
export const searchQueries = pgTable("search_queries", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  query: text("query").notNull(),
  category: text("category"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Each time we run a query against an AI provider, store the full result
export const queryResults = pgTable("query_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  searchQueryId: uuid("search_query_id").references(() => searchQueries.id, { onDelete: "cascade" }).notNull(),
  provider: aiProviderEnum("provider").notNull(),
  rawResponse: text("raw_response").notNull(),
  modelUsed: text("model_used"),
  tokensUsed: integer("tokens_used"),
  latencyMs: integer("latency_ms"),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
});

// Extracted brand mentions from each query result
export const brandMentions = pgTable("brand_mentions", {
  id: uuid("id").defaultRandom().primaryKey(),
  queryResultId: uuid("query_result_id").references(() => queryResults.id, { onDelete: "cascade" }).notNull(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "cascade" }).notNull(),
  mentioned: boolean("mentioned").default(false).notNull(),
  position: integer("position"),
  sentiment: sentimentEnum("sentiment"),
  context: text("context"),
  recommended: boolean("recommended").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Aggregated visibility scores (computed periodically)
export const visibilityScores = pgTable("visibility_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id").references(() => brands.id, { onDelete: "cascade" }).notNull(),
  workspaceId: uuid("workspace_id").references(() => workspaces.id, { onDelete: "cascade" }).notNull(),
  provider: aiProviderEnum("provider"),
  mentionRate: real("mention_rate").notNull(),
  avgPosition: real("avg_position"),
  sentimentScore: real("sentiment_score"),
  recommendationRate: real("recommendation_rate"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  computedAt: timestamp("computed_at").defaultNow().notNull(),
});
