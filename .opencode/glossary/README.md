# Locale Glossaries

Use this folder for locale-specific translation guidance that supplements `.ZYRAXON/agent/translator.md`.

The global glossary in `translator.md` remains the source of truth for shared do-not-translate terms (commands, code, paths, product names, etc.). These locale files capture community learnings about phrasing and terminology preferences.

## File Naming

- One file per locale
- Use lowercase locale slugs that match docs locales when possible (for example, `zh-cn.md`, `zh-tw.md`)
- If only language-level guidance exists, use the language code (for example, `fr.md`)
- Some repo locale slugs may be aliases/non-BCP47 for consistency (for example, `br` for Brazilian Portuguese / `pt-BR`)

## What To Put In A Locale File

- **Sources**: PRs/issues/discussions that motivated the guidance
- **Do Not Translate (Locale Additions)**: locale-specific terms or casing decisions
- **Preferred Terms**: recurring UI/docs words with preferred translations
- **Guidance**: tone, style, and consistency notes
- **Avoid** (optional): common literal translations or wording we should avoid
- If the repo uses a locale alias slug, document the alias in **Guidance** (for example, prose may mention `pt-BR` while config/examples use `br`)

Prefer guidance that is:

- Repeated across multiple docs/screens
- Easy to apply consistently
- Backed by a community contribution or review discussion

## Template

```md
# <locale> Glossary

## Sources

- PR #12345: https://github.com/onelpawarai/ZYRAXON-AI/pull/12345

## Do Not Translate (Locale Additions)

- `ZYRAXON` (preserve casing)

## Preferred Terms

| English | Preferred | Notes     |
| ------- | --------- | --------- |
| prompt  | ...       | preferred |
| session | ...       | preferred |

## Guidance

- Prefer natural phrasing over literal translation

## Avoid

- Avoid ... when ...
```

## Contribution Notes

- Mark entries as preferred when they may evolve
- Keep examples short
- Add or update the `Sources` section whenever you add a new rule
- Prefer PR-backed guidance over invented term mappings; start with general guidance if no term-level corrections exist yet

## ZYRAXON-specific terms

- **MCP Tools**: Model Context Protocol tools (136+ tools across 7 categories)
- **Self-Healing**: ZYRAXON's ability to detect and fix missing capabilities automatically
- **Memory System**: Cross-session memory via zyraxon.db with auto-injection of relevant memories per session
- **Agent Mode**: Operating mode (General, Build, Plan, Beast, PRO, APEX PREDATOR, DARK EMPEROR)
- **Stream Key**: YouTube RTMP stream key for live streaming
- **Tor Integration**: Anonymous browsing through Tor network
- **Desktop Automation**: Screen capture, TTS, app control capabilities
- **ULTRA Tools**: Advanced tools (code generation, auto deploy, security sweep, performance optimizer)
- **Service Manager**: Python script managing all ZYRAXON services
