# MetaMask Connect EVM Wagmi Integration

This example demonstrates integrating [MetaMask Connect](https://docs.metamask.io/metamask-connect/evm/quickstart/wagmi) with [wagmi](https://wagmi.sh/) using the `metaMask()` connector from `@wagmi/connectors`.

## Clone the repository

```bash
git clone https://github.com/MetaMask/metamask-connect-examples.git
cd metamask-connect-examples/integrations/wagmi
```

or using [degit](https://www.npmjs.com/package/degit)

```bash
npx degit MetaMask/metamask-connect-examples/integrations/wagmi mm-connect-evm-wagmi && cd mm-connect-evm-wagmi
```

## Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Create a `.env` file

```bash
cp .env.example .env.local
```

## Add your Infura API key

```bash
VITE_INFURA_API_KEY=your-infura-api-key
```

## Run

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```
