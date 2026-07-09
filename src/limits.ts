// Shared /limits report logic — the same spend readout (from the Wendl gateway or
// any LiteLLM-compatible proxy) used by the nanoclaw build, here parameterized by
// OpenClaw plugin config instead of .env. The budget-bar math lives in
// ./shared/spend-report.ts (one source of truth across both harnesses).

import { noRouterMessage } from './onboard.js';
import { renderBudgetLines, type SpendKey } from './shared/spend-report.js';

export interface LimitsConfig {
  litellmBaseUrl?: string;
  litellmMasterKey?: string;
  globalCapUsd?: number;
  keys?: string[];
}

const KEY_LABEL: Record<string, string> = {
  team: 'team chat (interactive)',
  ops: 'cron / automation',
};

export async function buildLimitsReport(cfg: LimitsConfig): Promise<string> {
  const base = cfg.litellmBaseUrl || 'http://localhost:4000';
  const key = cfg.litellmMasterKey;
  if (!key) return noRouterMessage('/limits');

  let keys: SpendKey[] = [];
  try {
    const res = await fetch(`${base}/spend/keys`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    keys = (await res.json()) as SpendKey[];
  } catch (err) {
    return `⚠️ /limits: configured, but couldn't reach the router at ${base} (${(err as Error).message}). Is the Wendl sidecar running?`;
  }

  const order = cfg.keys && cfg.keys.length ? cfg.keys : ['team', 'ops'];
  const lines: string[] = ['**Wendl limits** — 30-day window', ''];
  lines.push(...renderBudgetLines(keys, { order, labels: KEY_LABEL }));
  if (cfg.globalCapUsd) {
    lines.push('', `Global safety cap: $${cfg.globalCapUsd} / 30d across all keys`);
  }
  return lines.join('\n');
}
