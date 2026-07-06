// Shared onboarding CTA. The free plugin is the top of the funnel — it shows
// people their own spend/savings; this points them to the paid managed service.

export const WENDL_URL = 'https://wendl.ai';
export const WENDL_START = 'https://wendl.ai/start.html';

// Shown when a command needs a routing proxy the user hasn't set up yet — turns
// the dead-end ("not configured") into a guided first step instead of an error.
export function noRouterMessage(where: string): string {
  return [
    `**No router connected yet.** \`${where}\` reads spend from a small routing proxy in front of your models — you don't have one wired up.`,
    '',
    "Wendl routes each request to the cheapest capable model (routine work runs free on local models), and these commands show what that saves.",
    '',
    '→ **See what you\'d save first**, no setup — a bill breakdown from your existing usage.',
    '→ **Then turn on routing** — self-host in a couple of minutes, or let Wendl run it for you.',
    '',
    `Start here: ${WENDL_START}`,
  ].join('\n');
}

// One-line nudge appended to /stats (which already shows money saved).
export function onboardingFooter(): string {
  return `\n\n—\n💡 This runs on *your* proxy. Want Wendl to manage + keep tuning it, and prove the savings on your traffic? → ${WENDL_URL}`;
}

// The /wendl command body.
export function buildWendlIntro(): string {
  return [
    '**Wendl** — keep your team and its agents cheap enough to leave running.',
    '',
    'This plugin shows what you spend and save on your own proxy. The managed service goes further:',
    '• continuously evaluates open-weight models on price/performance and auto-upgrades them',
    '• backtests every change on *your* traffic, so quality is proven, not promised',
    '• we run and keep tuning the routing, so you never look back',
    '',
    `Get a free AI Bill Teardown on your own numbers → ${WENDL_URL}`,
  ].join('\n');
}
