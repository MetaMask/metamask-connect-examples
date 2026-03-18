# Contributing to MetaMask Connect Examples

Thanks for your interest in contributing! This guide covers the repo setup, tooling, and conventions you need to know.

## Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v9+

## Setup

Clone the repo and install the root dependencies:

```bash
git clone https://github.com/MetaMask/metamask-connect-examples.git
cd metamask-connect-examples
pnpm install
```

This installs the shared dev tooling and sets up Husky pre-commit hooks automatically via the `prepare` script.

To work on a specific quickstart, install its dependencies separately:

```bash
cd quickstarts/evm/react
pnpm install
```

## Project Structure

```
metamask-connect-examples/
├── quickstarts/
│   └── evm/
│       ├── javascript/
│       └── react/
├── eslint.config.js        # Root ESLint config (repo-wide)
├── .prettierrc             # Prettier config
├── .editorconfig           # Editor settings
└── package.json            # Root dev tooling
```

Each quickstart under `quickstarts/` is a **standalone project** with its own `package.json`, dependencies, and lockfile. End users clone individual quickstarts, so they must work independently without the root tooling.

## Code Quality

### Linting

ESLint is configured at the root with layered rules:

- Base `@eslint/js` recommended rules for all JavaScript files
- `typescript-eslint` recommended rules for TypeScript files in React projects
- `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` for React projects
- `eslint-config-prettier` to prevent conflicts with Prettier

```bash
pnpm lint          # Check for lint errors
pnpm lint:fix      # Auto-fix lint errors
```

### Formatting

Prettier enforces consistent formatting across the entire repo:

- No semicolons
- Single quotes
- Trailing commas
- 100 character line width
- 2 space indentation

```bash
pnpm format        # Format all files
pnpm format:check  # Check formatting without writing changes
```

### Pre-commit Hooks

Husky runs `lint-staged` before every commit. This automatically:

- Runs ESLint with `--fix` on staged `.js`, `.ts`, and `.tsx` files
- Runs Prettier on all staged files (JS, CSS, JSON, Markdown, HTML, YAML)

You don't need to run lint or format manually before committing -- the hook handles it.

## Adding a New Quickstart

1. Create a new directory under `quickstarts/{chain}/{framework}/`
2. Include a self-contained `package.json` with `dev`, `build`, `lint`, and `preview` scripts
3. Include a `.gitignore` that covers `node_modules`, `dist`, `.env`, and editor files
4. Include a `.env.example` with required environment variables
5. Include a `README.md` following the existing pattern (clone instructions, setup steps, run command)
6. If using React/TypeScript, include an `eslint.config.js` and `tsconfig.json` for standalone use

## Commit Messages

Write clear, concise commit messages. Use the imperative mood:

- `add EVM React quickstart`
- `fix wallet connection error handling`
- `update project dependencies`

## Opening a Pull Request

1. Create a feature branch from `main`
2. Make sure `pnpm lint` and `pnpm format:check` pass from the root
3. If you modified a quickstart, verify it runs with `pnpm dev` from that project directory
4. Open a PR with a description of what changed and why

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
