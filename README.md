<p align="center">
  <picture>
    <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
    <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="ZYRAXON logo">
  </picture>
</p>

<p align="center">The open source AI coding agent.</p>

<p align="center">
  <a href="https://github.com/onelpawarai/ZYRAXON-AI"><img alt="GitHub stars" src="https://img.shields.io/github/stars/onelpawarai/ZYRAXON-AI?style=flat-square" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/issues"><img alt="Issues" src="https://img.shields.io/github/issues/onelpawarai/ZYRAXON-AI?style=flat-square" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/releases"><img alt="Releases" src="https://img.shields.io/github/v/release/onelpawarai/ZYRAXON-AI?style=flat-square" /></a>
</p>

---

### Contact & Support

If you encounter any issues, bugs, or problems with the application, please contact us immediately via email with the error details and output:

**Email:** lxsayidi@gmail.com

When reporting an issue, please include:
- What you were trying to do
- The error message or unexpected behavior
- Screenshot or terminal output if possible
- Your OS and version (Windows/macOS/Linux)

---

## Features

- **AI-Powered Coding Agent** — Chat with AI to write, debug, and refactor code
- **Multi-Model Support** — Works with OpenAI, Anthropic, Google Gemini, DeepSeek, and more
- **Desktop App** — Native Electron app for Windows, macOS, and Linux
- **Image Generation** — Generate images using Pollinations AI (https://pollinations.ai/)
- **Video & Audio** — Find free AI tools for video and audio generation
- **Persistent Memory** — SQLite database with optimized performance for long sessions
- **MCP Integration** — Model Context Protocol for extending capabilities
- **Multiple Agents** — Build agent (full access) and Plan agent (read-only analysis)

## Desktop App Downloads

Download the latest release from the [Releases page](https://github.com/onelpawarai/ZYRAXON-AI/releases).

| Platform | File | Architecture |
|----------|------|--------------|
| Windows | `ZYRAXON Dev-0.1.1-win-installer.exe` | x64 |
| macOS | `zyraxon-desktop-mac-arm64.dmg` | Apple Silicon |
| macOS | `zyraxon-desktop-mac-x64.dmg` | Intel |
| Linux | `zyraxon-desktop-linux-x64.AppImage` | x64 |
| Linux | `zyraxon-desktop-linux-x64.deb` | x64 (Debian/Ubuntu) |
| Linux | `zyraxon-desktop-linux-x64.rpm` | x64 (Fedora/RHEL) |

## Installation

### Desktop App

**Windows:**
1. Download `ZYRAXON Dev-0.1.1-win-installer.exe` from [Releases](https://github.com/onelpawarai/ZYRAXON-AI/releases)
2. Run the installer
3. ZYRAXON will be installed to `%LOCALAPPDATA%\Programs\ZYRAXON Dev`

**macOS:**
1. Download `zyraxon-desktop-mac-arm64.dmg` (Apple Silicon) or `zyraxon-desktop-mac-x64.dmg` (Intel)
2. Open the DMG file
3. Drag ZYRAXON to Applications folder

**Linux:**
```bash
# AppImage (any distro)
chmod +x zyraxon-desktop-linux-x64.AppImage
./zyraxon-desktop-linux-x64.AppImage

# Debian/Ubuntu
sudo dpkg -i zyraxon-desktop-linux-x64.deb

# Fedora/RHEL
sudo rpm -i zyraxon-desktop-linux-x64.rpm
```

### CLI Tool

```bash
npm i -g opencode-ai@latest
```

## Building from Source

### Prerequisites

- **Bun** 1.3.14+ (https://bun.sh)
- **Node.js** 22+
- **Git**

### Setup

```bash
git clone https://github.com/onelpawarai/ZYRAXON-AI.git
cd ZYRAXON-AI
bun install --ignore-scripts
```

> **Important:** Always use `--ignore-scripts` with `bun install` to avoid the SolidJS pkg.pr.new hang issue.

### Build All Packages

```bash
# From root directory
NODE_OPTIONS="--max-old-space-size=4096" bun run --cwd packages/opencode build
```

### Build Desktop App

```bash
cd packages/desktop

# Build the app
NODE_OPTIONS="--max-old-space-size=4096" bun run build

# Package for your platform
bun run package        # Auto-detect current platform
bun run package:win    # Windows NSIS installer
bun run package:mac    # macOS DMG
bun run package:linux  # Linux AppImage + deb + rpm
```

### Build Output

After building, find the installers in `packages/desktop/dist/`:

| Platform | Output |
|----------|--------|
| Windows | `ZYRAXON Dev-0.1.1-win-installer.exe` |
| macOS | `zyraxon-desktop-mac-arm64.dmg` |
| Linux | `zyraxon-desktop-linux-x64.AppImage`, `.deb`, `.rpm` |

### Cross-Compilation Notes

- **Windows builds** must be done on Windows
- **macOS builds** (DMG) must be done on macOS
- **Linux builds** (AppImage/deb/rpm) must be done on Linux

electron-builder supports cross-compilation for some targets, but native builds are recommended for full functionality (code signing, notarization, etc.).

### Environment Variables

```bash
# Increase Node.js memory for large builds
NODE_OPTIONS="--max-old-space-size=4096"

# Set build channel (dev/beta/prod)
ZYRAXON_CHANNEL=dev
```

## Development

### Start Development Server

```bash
# TUI (terminal UI)
bun run dev

# Desktop app
bun run dev:desktop

# Web interface
bun run dev:web
```

### Project Structure

```
ZYRAXON-AI/
├── packages/
│   ├── opencode/          # Core AI agent (CLI)
│   ├── desktop/           # Electron desktop app
│   ├── app/               # Web UI (SolidJS)
│   ├── ui/                # Shared UI components
│   ├── session-ui/        # Session/chat UI
│   ├── core/              # Core utilities, database
│   ├── schema/            # TypeScript schemas
│   ├── llm/               # LLM provider integration
│   └── sdk/               # JavaScript SDK
├── README.md
└── package.json
```

### Key Technologies

- **Runtime:** Bun 1.3.14
- **Desktop:** Electron 42 + electron-vite
- **UI:** SolidJS + TailwindCSS
- **Database:** SQLite (via drizzle-orm)
- **Build:** electron-builder 26
- **Language:** TypeScript

## Agents

ZYRAXON includes built-in agents you can switch between with the `Tab` key:

- **build** — Default agent with full file system access for development work
- **plan** — Read-only agent for analysis and code exploration (denies file edits by default)
- **general** — Subagent for complex searches and multistep tasks (invoked via `@general`)

## Configuration

Configuration files are stored in:
- **Windows:** `%APPDATA%\zyraxon\`
- **macOS:** `~/Library/Application Support/zyraxon/`
- **Linux:** `~/.config/zyraxon/`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b my-feature`
3. Make your changes
4. Run typecheck: `bun typecheck`
5. Commit: `git commit -m "feat: add my feature"`
6. Push: `git push origin my-feature`
7. Open a Pull Request

For questions or suggestions, email us at **lxsayidi@gmail.com**

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**GitHub:** [onelpawarai/ZYRAXON-AI](https://github.com/onelpawarai/ZYRAXON-AI) | **Email:** lxsayidi@gmail.com