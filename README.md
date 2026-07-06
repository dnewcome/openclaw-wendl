# Wendl — OpenClaw plugin

Adds **`/limits`**, **`/stats`**, and **`/wendl`** to OpenClaw: per-key budget caps +
spend, money-saved-vs-premium, and a one-command intro to the managed service — all
with **zero token cost** (the commands run without invoking the agent).

The plugin is free and talks only to *your own* LiteLLM proxy. It's the front door
to [Wendl](https://wendl.ai): install it, watch `/stats` show what you're saving,
and onboard to the managed service when you want us to run and keep tuning it.

> Source of truth is the [wendl.ai](https://github.com/dnewcome/wendl.ai) monorepo
> (`plugins/openclaw`). **This repo is the built, install-ready release** — it ships
> compiled `dist/`, so there's no build step at install.

## Install from GitHub

```bash
openclaw plugins install git:github.com/dnewcome/openclaw-wendl@main
openclaw plugins enable wendl
```

## Configure

In `~/.openclaw/openclaw.json`:

```jsonc
{
  "plugins": {
    "entries": {
      "wendl": {
        "enabled": true,
        "config": {
          "litellmBaseUrl": "http://localhost:4000",
          "litellmMasterKey": "${LITELLM_MASTER_KEY}",
          "globalCapUsd": 300,
          "keys": ["team", "ops"]
        }
      }
    }
  }
}
```

Restart the gateway, then type **`/limits`** in any connected chat. Fields are
validated by `openclaw.plugin.json`'s schema; `litellmMasterKey` is required. The
plugin reads this config from `api.pluginConfig` at register time.

## Commands

| Command | What it does |
|---|---|
| `/limits` | Per-key budget caps + current spend, read from the proxy |
| `/stats`  | Money saved vs standard API billing on your recorded traffic |
| `/wendl`  | What Wendl is + how to get a managed setup |

## The routing itself is plain OpenClaw config (no plugin)

This plugin is only the budget/visibility UX. The actual tiered routing is OpenClaw
pointing at the LiteLLM proxy as a provider — add to `openclaw.json`:

```jsonc
{
  "models": {
    "mode": "merge",
    "providers": {
      "router": {
        "baseUrl": "http://localhost:4000/v1",
        "apiKey": "${LITELLM_TEAM_KEY}",
        "api": "openai-completions",
        "models": [
          { "id": "tier-local-small", "name": "Local (free)", "input": ["text"], "cost": {"input":0,"output":0}, "contextWindow": 128000, "maxTokens": 8192 },
          { "id": "tier-cheap", "name": "Haiku", "input": ["text"], "cost": {"input":1,"output":5}, "contextWindow": 200000, "maxTokens": 8192 },
          { "id": "tier-mid", "name": "Sonnet", "reasoning": true, "input": ["text","image"], "cost": {"input":2,"output":10}, "contextWindow": 200000, "maxTokens": 16384 }
        ]
      }
    }
  }
}
```

## Requirements & caveats

- A running **LiteLLM proxy** (the Wendl sidecar) reachable at `litellmBaseUrl`.
- **OpenClaw ≥ 2026.5.27** (validated against `2026.6.11`).
- Validated against the OpenClaw SDK **types** and builds clean, but not yet run on a
  live gateway here — treat the first `/limits` as a smoke test and run
  `openclaw doctor`. If a command doesn't register, check `openclaw plugins`.

## Updating

```bash
openclaw plugins update wendl        # or reinstall the git: source
# a gateway restart is required after any plugin code change
```

## Dev / rebuild

Source is in `wendl.ai/plugins/openclaw`. `npm install && npm run build` → `dist/`.
This release repo commits `dist/`, so installs need no build.
