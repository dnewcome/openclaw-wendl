// /stats for the OpenClaw plugin — money saved vs premium API billing.
// Note: aggregates ALL traffic the proxy recorded (the OpenClaw plugin config
// doesn't carry per-group virtual keys the way the nanoclaw build does). Scope
// via `keys` later if you mint per-agent keys.

import { LimitsConfig } from './limits.js';
import { onboardingFooter } from './onboard.js';

export interface StatsConfig extends LimitsConfig {
  baselines?: Array<{ name: string; in: number; out: number }>;
}

const DEFAULT_BASELINES = [
  { name: 'Claude Opus 4.8', in: 15, out: 75 },
  { name: 'Claude Sonnet 5', in: 3, out: 15 },
  { name: 'GPT-5 / Codex', in: 1.25, out: 10 },
];

interface SpendLog {
  spend?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

export async function buildStatsReport(cfg: StatsConfig): Promise<string> {
  const base = cfg.litellmBaseUrl || 'http://localhost:4000';
  const key = cfg.litellmMasterKey;
  if (!key) return '⚠️ /stats: litellmMasterKey not configured for the Wendl plugin.';

  let logs: SpendLog[] = [];
  try {
    const res = await fetch(`${base}/spend/logs`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    logs = Array.isArray(j) ? (j as SpendLog[]) : [];
  } catch (err) {
    return `⚠️ /stats: could not reach the router at ${base} (${(err as Error).message}).`;
  }

  let inTok = 0;
  let outTok = 0;
  let actual = 0;
  for (const l of logs) {
    inTok += Number(l.prompt_tokens || 0);
    outTok += Number(l.completion_tokens || 0);
    actual += Number(l.spend || 0);
  }

  const baselines = cfg.baselines?.length ? cfg.baselines : DEFAULT_BASELINES;
  const lines: string[] = ['**Wendl savings** — recorded usage', ''];
  lines.push(`Processed ${logs.length} requests · ${(inTok / 1e6).toFixed(2)}M in / ${(outTok / 1e6).toFixed(2)}M out tokens`);
  lines.push(`Actually spent: **$${actual.toFixed(2)}**`, '');
  lines.push('Had the same traffic gone to standard API billing:');
  for (const b of baselines) {
    const cost = (inTok / 1e6) * b.in + (outTok / 1e6) * b.out;
    const saved = cost - actual;
    const pct = cost > 0 ? (saved / cost) * 100 : 0;
    lines.push(`• **${b.name}**: $${cost.toFixed(2)} → ${saved >= 0 ? 'saved' : 'over by'} **$${Math.abs(saved).toFixed(2)}** (${pct.toFixed(0)}%)`);
  }
  return lines.join('\n') + onboardingFooter();
}
