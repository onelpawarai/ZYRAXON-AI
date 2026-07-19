<p align="center">
  <a href="https://ZYRAXON.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="ZYRAXON logo">
    </picture>
  </a>
</p>
<p align="center">Der Open-Source KI-Coding-Agent.</p>
<p align="center">
  <a href="https://ZYRAXON.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/ZYRAXON-ai"><img alt="npm" src="https://img.shields.io/npm/v/ZYRAXON-ai?style=flat-square" /></a>
  <a href="https://github.com/onelpawarai/ZYRAXON-AI/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/onelpawarai/ZYRAXON-AI/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![ZYRAXON Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://ZYRAXON.ai)

---

### Installation

```bash
# YOLO
curl -fsSL https://ZYRAXON.ai/install | bash

# Paketmanager
npm i -g ZYRAXON-ai@latest        # oder bun/pnpm/yarn
scoop install ZYRAXON             # Windows
choco install ZYRAXON             # Windows
brew install anomalyco/tap/ZYRAXON # macOS und Linux (empfohlen, immer aktuell)
brew install ZYRAXON              # macOS und Linux (offizielle Brew-Formula, seltener aktualisiert)
sudo pacman -S ZYRAXON            # Arch Linux (Stable)
paru -S ZYRAXON-bin               # Arch Linux (Latest from AUR)
mise use -g ZYRAXON               # jedes Betriebssystem
nix run nixpkgs#ZYRAXON           # oder github:onelpawarai/ZYRAXON-AI für den neuesten dev-Branch
```

> [!TIP]
> Entferne Versionen älter als 0.1.x vor der Installation.

### Desktop-App (BETA)

ZYRAXON ist auch als Desktop-Anwendung verfügbar. Lade sie direkt von der [Releases-Seite](https://github.com/onelpawarai/ZYRAXON-AI/releases) oder [ZYRAXON.ai/download](https://ZYRAXON.ai/download) herunter.

| Plattform             | Download                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `ZYRAXON-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `ZYRAXON-desktop-mac-x64.dmg`     |
| Windows               | `ZYRAXON-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm` oder AppImage       |

```bash
# macOS (Homebrew)
brew install --cask ZYRAXON-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/ZYRAXON-desktop
```

#### Installationsverzeichnis

Das Installationsskript beachtet die folgende Prioritätsreihenfolge für den Installationspfad:

1. `$ZYRAXON_INSTALL_DIR` - Benutzerdefiniertes Installationsverzeichnis
2. `$XDG_BIN_DIR` - XDG Base Directory Specification-konformer Pfad
3. `$HOME/bin` - Standard-Binärverzeichnis des Users (falls vorhanden oder erstellbar)
4. `$HOME/.ZYRAXON/bin` - Standard-Fallback

```bash
# Beispiele
ZYRAXON_INSTALL_DIR=/usr/local/bin curl -fsSL https://ZYRAXON.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://ZYRAXON.ai/install | bash
```

### Agents

ZYRAXON enthält zwei eingebaute Agents, zwischen denen du mit der `Tab`-Taste wechseln kannst.

- **build** - Standard-Agent mit vollem Zugriff für Entwicklungsarbeit
- **plan** - Nur-Lese-Agent für Analyse und Code-Exploration
  - Verweigert Datei-Edits standardmäßig
  - Fragt vor dem Ausführen von bash-Befehlen nach
  - Ideal zum Erkunden unbekannter Codebases oder zum Planen von Änderungen

Außerdem ist ein **general**-Subagent für komplexe Suchen und mehrstufige Aufgaben enthalten.
Dieser wird intern genutzt und kann in Nachrichten mit `@general` aufgerufen werden.

Mehr dazu unter [Agents](https://ZYRAXON.ai/docs/agents).

### Dokumentation

Mehr Infos zur Konfiguration von ZYRAXON findest du in unseren [**Docs**](https://ZYRAXON.ai/docs).

### Beitragen

Wenn du zu ZYRAXON beitragen möchtest, lies bitte unsere [Contributing Docs](./CONTRIBUTING.md), bevor du einen Pull Request einreichst.

### Auf ZYRAXON aufbauen

Wenn du an einem Projekt arbeitest, das mit ZYRAXON zusammenhängt und "ZYRAXON" als Teil seines Namens verwendet (z.B. "ZYRAXON-dashboard" oder "ZYRAXON-mobile"), füge bitte einen Hinweis in deine README ein, dass es nicht vom ZYRAXON-Team gebaut wird und nicht in irgendeiner Weise mit uns verbunden ist.

---

**Tritt unserer Community bei** [Discord](https://discord.gg/ZYRAXON) | [X.com](https://x.com/ZYRAXON)
