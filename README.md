<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="ZYRAXON" width="120">
  </picture>
</p>

<h1 align="center">ZYRAXON-AI</h1>

<p align="center">
  <strong>All in one. Anything. Nothing is impossible.</strong>
</p>

<p align="center">
  <a href="https://zyraxonai.lovable.app/"><img alt="Website" src="https://img.shields.io/badge/Website-zyraxonai.lovable.app-00f5ff?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/releases"><img alt="Version" src="https://img.shields.io/github/v/release/onelpawarai/ZYRAXON-AI?style=for-the-badge&color=blue" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/onelpawarai/ZYRAXON-AI?style=for-the-badge&color=yellow" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/issues"><img alt="Issues" src="https://img.shields.io/github/issues/onelpawarai/ZYRAXON-AI?style=for-the-badge&color=red" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/onelpawarai/ZYRAXON-AI?style=for-the-badge&color=green" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/onelpawarai/ZYRAXON-AI/total?style=for-the-badge&color=purple" /></a>
</p>

<p align="center">
  <a href="https://zyraxonai.lovable.app/"><strong>Visit our Website</strong></a> &nbsp;|&nbsp;
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/releases"><strong>Download</strong></a> &nbsp;|&nbsp;
  <a href="https://youtube.com/@zyraxon-aix"><strong>YouTube</strong></a>
</p>

<p align="center">
  <strong>Desktop AI agent that actually does things. Not a chatbot - an action-bot.</strong><br>
  Reads your files. Writes your code. Runs your commands. Builds your projects. Deploys your apps.<br>
  It has <strong>7 Agent Modes</strong>, <strong>136 Tools</strong>, <strong>Persistent Memory</strong>, and it <strong>evolves itself</strong>.
</p>

---

## What is ZYRAXON-AI?

ZYRAXON-AI is an open-source desktop AI agent built on Electron + SolidJS + Bun. Unlike ChatGPT or other chatbots that just *talk*, ZYRAXON **takes action** - it has full access to your filesystem, terminal, browser, and more.

It's built on top of [OpenCode](https://github.com/anomalyco/opencode) and extended with features that don't exist anywhere else:

- **7 Agent Modes** - Build, Plan, Beast, PRO, APEX PREDATOR, DARK EMPEROR, General
- **136 Tools** - 124 MCP tools + 8 ULTRA tools + 4 vision tools
- **Persistent Memory** - Remembers everything across sessions (SQLite-backed)
- **Self-Evolution** - Installs its own MCP servers and tools at runtime
- **Auto Screen Vision** - Automatically captures your screen before every response
- **Voice Input** - Click the mic, speak naturally, it transcribes via Whisper
- **20+ AI Models** - OpenAI, Anthropic, Gemini, DeepSeek, Meta, and more

---

## Agent Modes

ZYRAXON has **7 built-in agent modes**. Switch with the Tab key:

### Build Mode (Default)
The reliable workhorse. Full file system access + persistent memory.
> Read/Write files, Run commands, Browse web, Generate images, Remember everything

### Plan Mode
Strategic, read-only analysis. Plans the perfect approach before any action.
> Read-only analysis, Plan creation, Strategic thinking

### Beast Mode
Maximum power with 6 unique powers.
> Mission Control (3-level subagents) + Self-Evolution + Subagent Army + Autonomous Completion + Memory + Vision

### PRO Mode
Unlimited memory + free models. The professional's choice.
> Everything Build has + unlimited memory + free model access + screen vision

### APEX PREDATOR Mode
8 powers. Model selector hides. You are in full control.
> Omega Command Center + Eternal Memory + Annihilation Engine + Tool Mastery + Quantum Processing + Unbreakable Will + Predator's Intuition + ALWAYS-ON Screen Vision

### DARK EMPEROR Mode
**10 powers. NEVER refuses. NEVER stops. NEVER fails.**
> Supreme Sovereignty + Infinite Memory Core + Apocalypse Protocol + Omniscient Tool Mastery + Quantum Superprocessing + Absolute Will + Dark Omniscience + Void Vision + Dark Resonance + Emperor's Decree

**DARK EMPEROR has 8 exclusive ULTRA Tools:**
- ultraCodeGen - Master-level code generation
- ultraAutoDeploy - One-command deployment to any cloud
- ultraSecuritySweep - Complete security audit
- ultraPerformance - Performance optimization engine
- ultraRefactor - AI-powered code refactoring
- ultraTestGen - Comprehensive test suite generation
- ultraDocGen - Auto-documentation
- ultraDebug - Advanced debugging engine

### General Mode
Subagent for delegated tasks.

---

## Download

Download the latest release from our **[Releases page](https://github.com/onelpawarai/ZYRAXON-AI/releases)**:

| Platform | File | Architecture |
|----------|------|:------------:|
| Windows | ZYRAXON-Dev-win-installer.exe | x64 |
| Linux | zyraxon-desktop-linux-amd64.deb | x64 |
| Linux | zyraxon-desktop-linux-x86_64.AppImage | x64 |
| Linux | zyraxon-linux-x64.tar.gz | x64 |
| Linux | zyraxon-linux-arm64.tar.gz | arm64 |

---

## Build from Source

### Prerequisites

- **[Bun](https://bun.sh)** 1.3.14+ (JavaScript runtime & package manager)
- **[Git](https://git-scm.com/)** (version control)
- **[Node.js](https://nodejs.org/)** 22+ (required for some native modules)

### Step 1: Clone the repository

`ash
git clone https://github.com/onelpawarai/ZYRAXON-AI.git
cd ZYRAXON-AI
`

### Step 2: Install all dependencies

`ash
bun install
`

### Step 3: Build the core engine

`ash
cd packages/opencode
bun run build
cd ../..
`

### Step 4: Build the desktop app

`ash
cd packages/desktop
bun run build
`

### Step 5: Package the installer

**Windows:**
`ash
bun run package:win
`

**Linux:**
`ash
bun run package:linux
`

**macOS:**
`ash
bun run package:mac
`

The installer will be created in packages/desktop/dist/.

### Quick Build (All-in-One)

**Windows:**
`ash
git clone https://github.com/onelpawarai/ZYRAXON-AI.git
cd ZYRAXON-AI
bun install
cd packages/opencode && bun run build && cd ../..
cd packages/desktop && bun run build && bun run package:win
`

**Linux:**
`ash
git clone https://github.com/onelpawarai/ZYRAXON-AI.git
cd ZYRAXON-AI
bun install
cd packages/opencode && bun run build && cd ../..
cd packages/desktop && bun run build && bun run package:linux
`

**macOS:**
`ash
git clone https://github.com/onelpawarai/ZYRAXON-AI.git
cd ZYRAXON-AI
bun install
cd packages/opencode && bun run build && cd ../..
cd packages/desktop && bun run build && bun run package:mac
`

### Development Mode

`ash
# Run in development mode (desktop app)
cd packages/desktop
bun run dev

# Run core engine in TUI mode
cd packages/opencode
bun run dev
`

---

## 136 Tools

### MCP Tools (124) - 6 Servers
- **desktop** - Desktop automation (click, type, scroll, open apps)
- **playwright** - Headless browser automation (scraping, forms, testing)
- **fetch** - Web content fetcher (HTML, markdown, YouTube transcripts)
- **filesystem** - Direct file read/write/search
- **git** - Git operations (commit, log, diff, status)
- **strike-security** - Bug bounty toolkit (DNS, port scan, SSL, CORS, IDOR, etc.)

### ULTRA Tools (8) - DARK EMPEROR Exclusive
- ultraCodeGen - Master-level code generation
- ultraAutoDeploy - One-command cloud deployment
- ultraSecuritySweep - Complete security audit
- ultraPerformance - Performance optimization
- ultraRefactor - AI-powered refactoring
- ultraTestGen - Test suite generation
- ultraDocGen - Auto-documentation
- ultraDebug - Advanced debugging

### Vision Tools (4)
- utoCapture - Auto screen capture before every response
- getLatest - Get latest screenshot
- history - Screenshot history
- describe - Describe screen contents

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Desktop | Electron + electron-vite |
| UI | SolidJS + TailwindCSS |
| Database | SQLite (drizzle-orm) |
| Build | electron-builder |
| Language | TypeScript |
| LLM Runtime | AI SDK (Vercel) |

---

## Project Structure

`
ZYRAXON-AI/
  packages/
    opencode/          # Core AI agent engine
      src/
        agent/         # Agent modes (7 modes)
        mcp/           # MCP servers + ULTRA tools
        tool/          # Tools (memory, self_evolve, shell, etc.)
        session/       # Session management, LLM streaming
        screen/        # Auto screen vision
        memory/        # Auto-injection memory system
    desktop/           # Electron desktop app
    app/               # SolidJS UI
    ui/                # Shared UI components
    core/              # Core utilities, database
    tui/               # Terminal UI, themes
`

---

## Contributing

We love contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

1. **Fork** the repository
2. **Clone** your fork: git clone https://github.com/YOUR_USERNAME/ZYRAXON-AI.git
3. **Install**: un install
4. **Build**: cd packages/opencode && bun run build
5. **Create branch**: git checkout -b feat/my-feature
6. **Commit**: git commit -m "feat: add my feature"
7. **Push**: git push origin feat/my-feature
8. **Open PR**

---

## Roadmap

- [x] Beast Mode with 6 powers
- [x] APEX PREDATOR Mode with 8 powers
- [x] DARK EMPEROR Mode with 10 powers + 8 ULTRA tools
- [x] 136 total tools
- [x] Auto Screen Vision
- [x] Persistent Memory (SQLite)
- [x] Self-Evolution
- [x] Voice Input (Whisper)
- [x] Auto-update system
- [x] BSL 1.1 License
- [ ] Mobile companion app
- [ ] Plugin marketplace
- [ ] Team collaboration features
- [ ] Cloud sync (optional)

See [open issues](https://github.com/onelpawarai/ZYRAXON-AI/issues) for planned features and known issues.

---

## License

[Business Source License 1.1 (BSL 1.1)](./LICENSE) - Free for non-commercial use. Commercial use requires a paid license. Converts to Apache 2.0 on 2030-07-21.

---

<p align="center">
  <strong>Built with obsession. Powered by AI.</strong><br><br>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI">
    <img alt="ZYRAXON" src="https://img.shields.io/badge/ZYRAXON-All_in_one._Anything._Nothing_is_impossible-blue?style=for-the-badge&logo=github" />
  </a>
</p>