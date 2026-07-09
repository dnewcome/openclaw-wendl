// GENERATED from plugins/shared/spend-report.ts — do not edit here.
// Run `make sync-shared` to refresh (source of truth is plugins/shared/).
// Premium API list prices ($ / 1M tokens) — "what you'd pay on standard billing."
export const DEFAULT_BASELINES = [
    { name: 'Claude Opus 4.8', in: 15, out: 75 },
    { name: 'Claude Sonnet 5', in: 3, out: 15 },
    { name: 'GPT-5 / Codex', in: 1.25, out: 10 },
];
export function bar(pct) {
    const n = Math.max(0, Math.min(10, Math.round(pct / 10)));
    return '█'.repeat(n) + '░'.repeat(10 - n);
}
// Budget bars for the virtual keys we care about, in a preferred alias order.
export function renderBudgetLines(keys, opts = {}) {
    const order = opts.order ?? ['team', 'ops'];
    const labels = opts.labels ?? {};
    const shown = keys
        .filter((k) => k.key_alias && order.includes(k.key_alias))
        .sort((a, b) => order.indexOf(a.key_alias) - order.indexOf(b.key_alias));
    if (shown.length === 0)
        return ['_No budgeted keys found._'];
    return shown.map((k) => {
        const spent = Number(k.spend || 0);
        const cap = Number(k.max_budget || 0);
        const pct = cap ? (spent / cap) * 100 : 0;
        const label = labels[k.key_alias] ?? k.key_alias;
        return `\`${bar(pct)}\` **${label}** — $${spent.toFixed(2)} / $${cap.toFixed(2)} (${pct.toFixed(0)}%)`;
    });
}
export function sumLogs(logs) {
    const t = { inTok: 0, outTok: 0, actual: 0, n: 0 };
    for (const l of logs) {
        t.inTok += Number(l.prompt_tokens || 0);
        t.outTok += Number(l.completion_tokens || 0);
        t.actual += Number(l.spend || 0);
        t.n++;
    }
    return t;
}
// Savings vs premium API list prices on the SAME tokens. Returns the core report
// lines; the harness prepends its own title and appends its own footer.
export function renderSavingsLines(t, opts = {}) {
    const baselines = opts.baselines?.length ? opts.baselines : DEFAULT_BASELINES;
    const spentLabel = opts.spentLabel ?? 'Actually spent';
    const lines = [
        `Processed **${t.n}** requests · ${(t.inTok / 1e6).toFixed(2)}M in / ${(t.outTok / 1e6).toFixed(2)}M out tokens`,
        `${spentLabel}: **$${t.actual.toFixed(2)}**`,
        '',
        'Had the same traffic gone to standard API billing:',
    ];
    for (const b of baselines) {
        const cost = (t.inTok / 1e6) * b.in + (t.outTok / 1e6) * b.out;
        const saved = cost - t.actual;
        const pct = cost > 0 ? (saved / cost) * 100 : 0;
        lines.push(`• **${b.name}**: $${cost.toFixed(2)} → ${saved >= 0 ? 'saved' : 'over by'} **$${Math.abs(saved).toFixed(2)}** (${pct.toFixed(0)}%)`);
    }
    return lines;
}
