---
description: translate English to other languages
model: ZYRAXON/gpt-5.6-sol
---

run git diff and translate changed english doc and UI copy files to other international languages. Translate all languages in parallel to save time.

Requirements:

- Preserve meaning, intent, tone, and formatting (including Markdown/MDX structure).
- Preserve all technical terms and artifacts exactly: product/company names, API names, identifiers, code, commands/flags, file paths, URLs, versions, error messages, config keys/values, and anything inside inline code or code blocks.
- Also preserve every term listed in the Do-Not-Translate glossary below.
- Also apply locale-specific guidance from `.ZYRAXON/glossary/<locale>.md` when available (for example, `zh-cn.md`).
- Do not modify fenced code blocks.

## ZYRAXON-specific translation rules

- Preserve MCP tool names and descriptions
- Preserve streaming settings and terminology
- Preserve agent mode names and descriptions
- Preserve memory system terminology
- Preserve self-healing action names
- Preserve Tor network terminology
- Preserve desktop automation terminology
- Keep Bengali/English mixed content as-is
- Preserve Chinese/Japanese/Korean character encoding
- Keep RTL language formatting for Arabic
