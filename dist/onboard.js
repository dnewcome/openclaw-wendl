// Shared onboarding CTA. The free plugin is the top of the funnel — it shows
// people their own spend/savings; this points them to the paid managed service.
export const WENDL_URL = 'https://wendl.ai';
// One-line nudge appended to /stats (which already shows money saved).
export function onboardingFooter() {
    return `\n\n—\n💡 This runs on *your* proxy. Want Wendl to manage + keep tuning it, and prove the savings on your traffic? → ${WENDL_URL}`;
}
// The /wendl command body.
export function buildWendlIntro() {
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
