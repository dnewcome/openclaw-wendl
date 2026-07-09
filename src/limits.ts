// Shared /limits report logic — the same spend readout (from the Wendl gateway or
// any LiteLLM-compatible proxy) used by the nanoclaw build, here parameterized by
// OpenClaw plugin config instead of .env.

import { noRouterMessage } from './onboard.js';

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

interface SpendKey {
  key_alias?: string;
  spend?: number;
  max_budget?: number;
}

function bar(pct: number): string {
  const n = Math.max(0, Math.min(10, Math.round(pct / 10)));
  return '█'.repeat(n) + '░'.repeat(10 - n);
}

export async function buildLimitsReport(cfg: LimitsConfig): Promise<string> {
  const base = cfg.litellmBaseUrl || 'http://localhost:4000';
  const key = cfg.litellmMasterKey;
  if (!key) return noRouterMessage('/limits');

  const want = new Set(cfg.keys && cfg.keys.length ? cfg.keys : ['team', 'ops']);

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

  const shown = keys.filter((k) => k.key_alias && want.has(k.key_alias));
  const lines: string[] = ['**Wendl limits** — 30-day window', ''];
  if (shown.length === 0) lines.push('_No budgeted keys found._');
  for (const k of shown) {
    const spent = Number(k.spend || 0);
    const cap = Number(k.max_budget || 0);
    const pct = cap ? (spent / cap) * 100 : 0;
    const label = KEY_LABEL[k.key_alias!] ?? k.key_alias;
    lines.push(`\`${bar(pct)}\` **${label}** — $${spent.toFixed(2)} / $${cap.toFixed(2)} (${pct.toFixed(0)}%)`);
  }
  if (cfg.globalCapUsd) {
    lines.push('', `Global safety cap: $${cfg.globalCapUsd} / 30d across all keys`);
  }
  return lines.join('\n');
}
