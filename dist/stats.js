// /stats for the OpenClaw plugin — money saved vs premium API billing.
// Note: aggregates ALL traffic the proxy recorded (the OpenClaw plugin config
// doesn't carry per-group virtual keys the way the nanoclaw build does). Scope
// via `keys` later if you mint per-agent keys. The savings math lives in
// ./shared/spend-report.ts (one source of truth across both harnesses).
import { onboardingFooter, noRouterMessage } from './onboard.js';
import { sumLogs, renderSavingsLines } from './shared/spend-report.js';
export async function buildStatsReport(cfg) {
    const base = cfg.litellmBaseUrl || 'http://localhost:4000';
    const key = cfg.litellmMasterKey;
    if (!key)
        return noRouterMessage('/stats');
    let logs = [];
    try {
        const res = await fetch(`${base}/spend/logs`, { headers: { Authorization: `Bearer ${key}` } });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        logs = Array.isArray(j) ? j : [];
    }
    catch (err) {
        return `⚠️ /stats: configured, but couldn't reach the router at ${base} (${err.message}). Is the Wendl sidecar running?`;
    }
    const lines = ['**Wendl savings** — recorded usage', ''];
    lines.push(...renderSavingsLines(sumLogs(logs), { baselines: cfg.baselines }));
    return lines.join('\n') + onboardingFooter();
}
