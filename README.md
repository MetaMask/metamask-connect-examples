# MetaMask Connect Examples

Quickstart examples for [MetaMask Connect](https://docs.metamask.io/metamask-connect/) across different chains and frameworks.

Each quickstart is a standalone project that can be cloned and run independently.

## Quickstarts

### EVM

| Framework  | Directory                                                  | Docs                                                                                             |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| JavaScript | [`quickstarts/evm/javascript`](quickstarts/evm/javascript) | [EVM JavaScript Quickstart](https://docs.metamask.io/metamask-connect/evm/quickstart/javascript) |
| React      | [`quickstarts/evm/react`](quickstarts/evm/react)           | [EVM React Quickstart](https://docs.metamask.io/metamask-connect/evm/quickstart/react)           |

## Getting Started

Pick a quickstart and clone it directly using [degit](https://www.npmjs.com/package/degit):

```bash
npx degit MetaMask/metamask-connect-examples/quickstarts/evm/react my-project
cd my-project
pnpm install
cp .env.example .env.local
pnpm dev
```

Or clone the full repo and navigate to the quickstart you want:

```bash
git clone https://github.com/MetaMask/metamask-connect-examples.git
cd metamask-connect-examples/quickstarts/evm/react
pnpm install
```

Each quickstart has its own README with specific setup instructions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, code quality tooling, and guidelines for adding new quickstarts.

Quick start for contributors:

```bash
git clone https://github.com/MetaMask/metamask-connect-examples.git
cd metamask-connect-examples
pnpm install
```

| Script              | Description                      |
| ------------------- | -------------------------------- |
| `pnpm lint`         | Lint all files                   |
| `pnpm lint:fix`     | Lint and auto-fix all files      |
| `pnpm format`       | Format all files with Prettier   |
| `pnpm format:check` | Check formatting without writing |

## License

[MIT](LICENSE)
