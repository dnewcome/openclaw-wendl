import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { buildLimitsReport } from './limits.js';
import { buildStatsReport } from './stats.js';
import { buildWendlIntro } from './onboard.js';
// Wendl OpenClaw plugin.
//
// Registers the `/limits` command, which runs WITHOUT invoking the agent
// (zero token cost) and prints per-key budget caps + spend read from a LiteLLM
// proxy. The routing itself is plain OpenClaw config (models.providers -> the
// proxy) — see README.md; this plugin is the budget/visibility UX on top.
//
// Verified against the openclaw SDK plugin-entry types (2026.6.x): the plugin's
// OWN config (litellmBaseUrl, litellmMasterKey, keys, globalCapUsd — resolved by
// the gateway from openclaw.plugin.json's configSchema) is handed to us on the
// `api` at register time as `api.pluginConfig`. It is NOT on the command context
// — `ctx.config` there is the whole OpenClawConfig. Handlers return a ReplyPayload
// (`{ text }`), so the report logic in limits.ts/stats.ts is unchanged.
export default definePluginEntry({
    id: 'wendl',
    name: 'Wendl',
    description: 'Budget-aware routing companion: /limits shows per-key caps + spend.',
    register(api) {
        const config = (api.pluginConfig ?? {});
        api.registerCommand({
            name: 'limits',
            description: 'Show current model budget caps and spend',
            acceptsArgs: false,
            requireAuth: false,
            handler: async () => ({ text: await buildLimitsReport(config) }),
        });
        api.registerCommand({
            name: 'stats',
            description: 'Show money saved vs premium API billing',
            acceptsArgs: false,
            requireAuth: false,
            handler: async () => ({ text: await buildStatsReport(config) }),
        });
        // Funnel entry: the free plugin points at the paid managed service.
        api.registerCommand({
            name: 'wendl',
            description: 'What Wendl is + how to get a managed setup',
            acceptsArgs: false,
            requireAuth: false,
            handler: async () => ({ text: buildWendlIntro() }),
        });
    },
});
