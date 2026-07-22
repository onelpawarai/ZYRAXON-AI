# ZYRAXON Mobile App

## Overview

This is the mobile companion app for ZYRAXON-AI, an open-source desktop AI agent. The mobile app provides on-the-go access to ZYRAXON's powerful AI capabilities.

## Tech Stack

- **Framework**: Expo SDK 52 with React Native 0.76
- **Language**: TypeScript
- **State Management**: Zustand with AsyncStorage persistence
- **Navigation**: Expo Router (file-based routing)
- **UI**: Custom components with dark theme

## Features

### Agent Modes
- Build Mode: Standard coding assistant
- Plan Mode: Strategic analysis
- Beast Mode: Maximum power with self-healing
- PRO Mode: Professional with unlimited memory
- APEX Mode: Predator mode with eternal memory
- DARK EMPEROR Mode: Supreme mode with ZERO REFUSAL + ULTRA Tools
- General Mode: General purpose assistant

### Tools
- File Operations: read, write, edit, glob, grep
- Execution: shell, task, execute, code-mode
- Web: webfetch, websearch
- AI & Memory: memory, self_evolve, screen_vision
- MCP Tools: desktop, playwright, filesystem, git, security
- ULTRA Tools (DARK EMPEROR only): 8 exclusive powerful tools

### Memory System
- Eternal Memory: Stores 50,000+ memories with compression
- Category-based organization
- Access tracking and importance scoring

## Development

### Prerequisites
- Node.js 18+
- Bun or npm
- Expo CLI (`npx expo`)

### Setup
```bash
cd packages/mobile
bun install
bun run dev
```

### Building APK
```bash
# Development build
bun run prebuild
bun run run:android

# Production build with EAS
bun run build:prod
```

## Project Structure

```
packages/mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation
│   │   ├── index.tsx       # Chat screen
│   │   ├── sessions.tsx    # Sessions list
│   │   ├── tools.tsx       # Tools browser
│   │   ├── memory.tsx      # Memory view
│   │   └── settings.tsx    # Settings
│   ├── chat.tsx            # Full-screen chat
│   └── mode-select.tsx     # Mode selection modal
├── src/
│   ├── components/         # Reusable UI components
│   ├── store/             # Zustand state management
│   ├── services/          # API and external services
│   └── types/             # TypeScript type definitions
└── assets/                # Images and fonts
```

## API Integration

The mobile app connects to ZYRAXON's HTTP API server:

- Default server URL: `http://localhost:4096`
- Configurable in settings
- Real-time updates via WebSocket (future enhancement)

## Build Configuration

### Android
- Package: `ai.zyraxon.mobile`
- Permissions: Camera, Microphone, Storage, Location
- Deep linking: `zyraxonai://` scheme

### iOS
- Bundle ID: `ai.zyraxon.mobile`
- Info.plist permissions for camera, microphone, photos
