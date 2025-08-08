## Contributing

Thanks for your interest!

### Setup
1. Node 20+, pnpm (recommended) or npm
2. Rust stable (for Tauri builds)
3. Install deps: `pnpm i` or `npm i`

### Commands
- Dev (web): `npm run dev`
- Dev (tauri): `npm run tauri:dev`
- Type-check: `npm run type-check`
- Lint: `npm run lint`
- Build: `npm run build`

### PR Rules
- Keep PRs focused and small
- Use Conventional Commits style if possible
- Add tests when adding logic

### Git Hooks
Husky + lint-staged run on pre-commit for lint/format.

