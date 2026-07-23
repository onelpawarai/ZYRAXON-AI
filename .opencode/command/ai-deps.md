---
description: "Bump AI sdk dependencies minor / patch versions only"
---

Please read @package.json and @packages/ZYRAXON/package.json.

Your job is to look into AI SDK dependencies, figure out if they have versions that can be upgraded (minor or patch versions ONLY no major ignore major changes).

I want a report of every dependency and the version that can be upgraded to.
What would be even better is if you can give me brief summary of the changes for each dep and a link to the changelog for each dependency, or at least some reference info so I can see what bugs were fixed or new features were added.

Consider using subagents for each dep to save your context window.

Here is a short list of some deps (please be comprehensive though):

- "ai"
- "@ai-sdk/openai"
- "@ai-sdk/anthropic"
- "@openrouter/ai-sdk-provider"
- "@modelcontextprotocol/sdk" (for MCP tools)
- "ffmpeg-static" (for streaming)
- "pyautogui" (for desktop automation)
- "stemmer" (for NLP)
- etc, etc

DO NOT upgrade the dependencies yet, just make a list of all dependencies and their versions that can be upgraded to minor or patch versions only.

## ZYRAXON-specific dependencies

- MCP tools dependencies (Model Context Protocol)
- Streaming dependencies (ffmpeg, RTMP)
- Memory system dependencies (SQLite, JSON)
- Self-healing dependencies (auto-install, retry logic)
- Tor integration dependencies (SOCKS5, .onion)
- Desktop automation dependencies (screenshot, TTS, app control)

Write up your findings to ai-sdk-updates.md
