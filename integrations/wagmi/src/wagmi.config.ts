import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, lineaSepolia, baseSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

const INFURA_KEY = import.meta.env.VITE_INFURA_API_KEY

export const config = createConfig({
  chains: [mainnet, sepolia, lineaSepolia, baseSepolia],
  connectors: [
    metaMask({
      dapp: {
        name: 'MetaMask Connect EVM Wagmi Quickstart',
        url: window.location.href,
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(`https://mainnet.infura.io/v3/${INFURA_KEY}`),
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_KEY}`),
    [lineaSepolia.id]: http(`https://linea-sepolia.infura.io/v3/${INFURA_KEY}`),
    [baseSepolia.id]: http(`https://base-sepolia.infura.io/v3/${INFURA_KEY}`),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
