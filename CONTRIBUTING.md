# Contributing to ZYRAXON-AI

Thank you for your interest in contributing to ZYRAXON-AI! This document provides guidelines and information about contributing.

## How to Contribute

### Reporting Bugs

1. Check existing [issues](https://github.com/onelpawarai/ZYRAXON-AI/issues) to avoid duplicates
2. Create a new issue using the **Bug Report** template
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Your OS and ZYRAXON version

### Suggesting Features

1. Check existing [issues](https://github.com/onelpawarai/ZYRAXON-AI/issues) for similar suggestions
2. Create a new issue using the **Feature Request** template
3. Explain:
   - What the feature does
   - Why it would be useful
   - How it should work

### Submitting Code

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ZYRAXON-AI.git
   cd ZYRAXON-AI
   ```
3. **Install dependencies**:
   ```bash
   bun install
   ```
4. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make your changes**
6. **Build and test**:
   ```bash
   cd packages/opencode
   bun run build
   cd ../desktop
   bun run build
   ```
7. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add new feature description"
   ```
8. **Push** and create a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` â€” New feature
- `fix:` â€” Bug fix
- `docs:` â€” Documentation changes
- `style:` â€” Code style changes (formatting, etc.)
- `refactor:` â€” Code refactoring
- `test:` â€” Adding tests
- `chore:` â€” Maintenance tasks

### Development Setup

#### Prerequisites
- [Bun](https://bun.sh/) v1.3+
- [Node.js](https://nodejs.org/) v20+
- [Git](https://git-scm.com/)

#### Project Structure
```
ZYRAXON-AI/
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ opencode/        # Core AI agent
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ agent/   # Agent definitions
â”‚   â”‚   â”‚   â”œâ”€â”€ tool/    # Built-in tools
â”‚   â”‚   â”‚   â””â”€â”€ pro/     # Pro features
â”‚   â”‚   â””â”€â”€ package.json
â”‚   â””â”€â”€ desktop/         # Electron desktop app
â”‚       â”œâ”€â”€ electron/    # Main process
â”‚       â””â”€â”€ src/         # Renderer (SolidJS)
â””â”€â”€ script/              # Build scripts
```

### Adding a New Tool

1. Create `packages/opencode/src/tool/your_tool.ts`
2. Create `packages/opencode/src/tool/your_tool.txt` (description)
3. Import and register in `packages/opencode/src/tool/registry.ts`
4. Build and test:
   ```bash
   cd packages/opencode
   bun run build
   ```

### Adding a New Agent

1. Edit `packages/opencode/src/agent/agent.ts`
2. Add agent definition with name, description, permissions
3. Create prompt file in `packages/opencode/src/agent/prompt/`
4. Build and test

### Code Style

- Use TypeScript
- Follow existing code patterns
- Use meaningful variable/function names
- Add comments for complex logic
- Keep functions small and focused

### Pull Request Guidelines

- PR should have a clear title and description
- Reference related issues (e.g., "Fixes #123")
- Include screenshots for UI changes
- Ensure the build passes before submitting
- Keep PRs focused â€” one feature/fix per PR

## Areas for Contribution

- ðŸ”§ **Tools** â€” Add new tools for ZYRAXON
- ðŸ¤– **Agents** â€” Create new agent modes
- ðŸ› **Bug Fixes** â€” Fix reported issues
- ðŸ“š **Documentation** â€” Improve docs
- ðŸ§ª **Testing** â€” Add test coverage
- ðŸŒ **Localization** â€” Translate to other languages
- ðŸŽ¨ **UI/UX** â€” Improve the desktop app

## Questions?

If you have questions, feel free to:
- Open a [Discussion](https://github.com/onelpawarai/ZYRAXON-AI/discussions)
- Ask in an [issue](https://github.com/onelpawarai/ZYRAXON-AI/issues)

Thank you for contributing to ZYRAXON-AI! ðŸš€
