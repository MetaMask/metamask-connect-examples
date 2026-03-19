import type { AddEthereumChainParameter } from '@metamask/connect-evm'

export type ChainInfo = {
  name: string
  nativeCurrency: { name: string; symbol: string; decimals: number }
  rpcUrlBase: string
  explorerUrl: string
}

export const CHAINS: Record<string, ChainInfo> = {
  '0x1': {
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrlBase: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
  },
  '0xaa36a7': {
    name: 'Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrlBase: 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
  },
  '0xe705': {
    name: 'Linea Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrlBase: 'https://linea-sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.lineascan.build',
  },
  '0x14a34': {
    name: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrlBase: 'https://base-sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.basescan.org',
  },
}

export function getChainName(chainId: string): string {
  return CHAINS[chainId]?.name ?? chainId
}

export function getExplorerTxUrl(chainId: string, txHash: string): string | undefined {
  const chain = CHAINS[chainId]
  return chain ? `${chain.explorerUrl}/tx/${txHash}` : undefined
}

export function textToHex(text: string): string {
  return (
    '0x' +
    Array.from(new TextEncoder().encode(text))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  )
}

export function ethToHexWei(eth: string): string {
  const ethValue = parseFloat(eth) || 0
  const weiValue = BigInt(Math.round(ethValue * 1e18))
  return '0x' + weiValue.toString(16)
}

export function weiToEth(wei: string): string {
  const ethBalance = Number(BigInt(wei)) / 1e18
  return `${ethBalance.toFixed(4)} ETH`
}

export function handleError(error: unknown): void {
  const err = error as { code?: number }
  if (err.code === 4001) {
    console.error('Request rejected by user')
  } else if (err.code === -32002) {
    console.error('Request already pending')
  } else {
    console.error(error)
  }
}

export function buildChainConfig(
  chainId: string,
  infuraApiKey: string,
): AddEthereumChainParameter | undefined {
  const chain = CHAINS[chainId]
  if (!chain) return undefined
  return {
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: [chain.rpcUrlBase + infuraApiKey],
    blockExplorerUrls: [chain.explorerUrl],
  }
}

export type Result = { label: string; value: string; url?: string }
