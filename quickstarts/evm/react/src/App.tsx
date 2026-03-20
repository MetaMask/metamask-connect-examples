import { useCallback, useEffect, useRef, useState } from 'react'
// IMP START - MetaMask Connect Import
import { createEVMClient, getInfuraRpcUrls } from '@metamask/connect-evm'
// IMP END - MetaMask Connect Import
import {
  CHAINS,
  getChainName,
  getExplorerTxUrl,
  textToHex,
  ethToHexWei,
  weiToEth,
  handleError,
  buildChainConfig,
  type Result,
} from './utils.ts'

import metaMaskLogo from './assets/mm-fox.svg'
import './App.css'

const SWITCH_CHAINS = Object.entries(CHAINS).map(([id, info]) => ({
  id,
  name: info.name,
}))

// IMP START - Initialize MetaMask Connect
const client = await createEVMClient({
  dapp: {
    name: 'My MetaMask Connect EVM React DApp',
    url: window.location.href,
  },
  api: {
    supportedNetworks: {
      ...getInfuraRpcUrls({
        infuraApiKey: import.meta.env.VITE_INFURA_API_KEY,
        chainIds: ['0x1', '0xaa36a7'],
      }),
      '0xe705': 'https://linea-sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY,
      '0x14a34': 'https://base-sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY,
    },
  },
  ui: {
    headless: false,
    preferExtension: true,
  },
})
// IMP END - Initialize MetaMask Connect

// IMP START - Get Provider
const provider = client.getProvider()
// IMP END - Get Provider

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState('--')
  const [result, setResult] = useState<Result | null>(null)
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)

  const [signMsg, setSignMsg] = useState('Sign in to My MetaMask Connect EVM dapp')
  const [sendTo, setSendTo] = useState('0x88Be81032970baDD93DBfB801039fbdA51dfb836')
  const [sendValue, setSendValue] = useState('0.01')

  const chainSwitcherRef = useRef<HTMLDivElement>(null)

  const isConnected = account !== null

  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const wei = await provider.request({
        method: 'eth_getBalance',
        params: [addr, 'latest'],
      })
      setBalance(weiToEth(wei as string))
    } catch {
      setBalance('--')
    }
  }, [])

  const showConnected = useCallback(
    (addr: string, chain: string) => {
      setAccount(addr)
      setChainId(chain)
      fetchBalance(addr)
    },
    [fetchBalance],
  )

  const showDisconnected = useCallback(() => {
    setAccount(null)
    setChainId(null)
    setBalance('--')
    setResult(null)
  }, [])

  useEffect(() => {
    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        showDisconnected()
        return
      }
      const chain = client.getChainId()
      showConnected(accounts[0], chain ?? '')
    }

    const onChainChanged = (newChainId: string) => {
      const addr = client.getAccount()
      if (addr) {
        setChainId(newChainId)
        fetchBalance(addr)
      }
    }

    const onDisconnect = () => {
      showDisconnected()
    }

    provider.on('accountsChanged', onAccountsChanged)
    provider.on('chainChanged', onChainChanged)
    provider.on('disconnect', onDisconnect)

    return () => {
      provider.off('accountsChanged', onAccountsChanged)
      provider.off('chainChanged', onChainChanged)
      provider.off('disconnect', onDisconnect)
    }
  }, [fetchBalance, showConnected, showDisconnected])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chainSwitcherRef.current && !chainSwitcherRef.current.contains(e.target as Node)) {
        setChainDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // IMP START - Connect with MetaMask Wallet
  const handleConnect = async () => {
    setLoadingBtn('connect')
    try {
      const { accounts, chainId } = await client.connect({
        chainIds: ['0xaa36a7', '0xe705', '0x14a34'],
      })

      showConnected(accounts[0], chainId)
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }
  // IMP END - Connect with MetaMask Wallet

  // IMP START - Connect and Sign
  const handleConnectSign = async () => {
    setLoadingBtn('connectSign')
    try {
      const signature = await client.connectAndSign({
        message: 'Sign in to My MetaMask Connect EVM dapp',
        chainIds: ['0xaa36a7'],
      })
      const addr = client.getAccount()
      const chain = client.getChainId()
      if (addr && chain) {
        showConnected(addr, chain)
      }
      setResult({ label: 'Signature', value: signature })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }
  // IMP END - Connect and Sign

  // IMP START - Connect With
  const handleConnectSend = async () => {
    setLoadingBtn('connectSend')
    try {
      const txHash = await client.connectWith({
        method: 'eth_sendTransaction',
        params: (acct) => [
          {
            from: acct,
            to: acct,
            value: '0x0',
          },
        ],
        chainIds: ['0xaa36a7'],
      })
      const addr = client.getAccount()
      const chain = client.getChainId()
      if (addr && chain) {
        showConnected(addr, chain)
      }
      setResult({
        label: 'Transaction Hash',
        value: txHash as string,
        url: chain ? getExplorerTxUrl(chain, txHash as string) : undefined,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }
  // IMP END - Connect With

  // IMP START - Disconnect from MetaMask Wallet
  const handleDisconnect = async () => {
    try {
      await client.disconnect()
      showDisconnected()
    } catch (error) {
      console.error(error)
    }
  }
  // IMP END - Disconnect from MetaMask Wallet

  // IMP START - Sign Message
  const handleSignMessage = async () => {
    const addr = client.getAccount()
    if (!addr) return
    setLoadingBtn('signMsg')
    try {
      const msg = signMsg || 'Hello from My DApp'
      const signature = await provider.request({
        method: 'personal_sign',
        params: [textToHex(msg), addr],
      })
      setResult({ label: 'Signature', value: signature as string })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }
  // IMP END - Sign Message

  // IMP START - Send Transaction
  const handleSendTransaction = async () => {
    const addr = client.getAccount()
    if (!addr) return
    setLoadingBtn('sendTx')
    try {
      const to = sendTo.trim() || addr
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: addr, to, value: ethToHexWei(sendValue) }],
      })
      const currentChain = client.getChainId()
      setResult({
        label: 'Transaction Hash',
        value: txHash as string,
        url: currentChain ? getExplorerTxUrl(currentChain, txHash as string) : undefined,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }
  // IMP END - Send Transaction

  // IMP START - Switch Chain
  const handleSwitchChain = async (targetChainId: string) => {
    setChainDropdownOpen(false)
    try {
      const chainConfig = buildChainConfig(targetChainId, import.meta.env.VITE_INFURA_API_KEY)
      await client.switchChain({
        chainId: targetChainId as `0x${string}`,
        ...(chainConfig && { chainConfiguration: chainConfig }),
      })
    } catch (error) {
      handleError(error)
    }
  }
  // IMP END - Switch Chain

  return (
    <div className="container">
      <header className="header">
        <a href="https://metamask.io" target="_blank" rel="noreferrer">
          <img src={metaMaskLogo} className="logo" alt="MetaMask logo" />
        </a>
        <h1>MetaMask Connect EVM React Quickstart</h1>
        <p className="subtitle">Connect, sign messages, and send transactions</p>
      </header>

      {!isConnected && (
        <section className="section">
          <div className="actions-grid">
            <div className="action-card">
              <h3>Connect</h3>
              <p className="action-desc">Connect your wallet to get started</p>
              <button
                className="btn btn-primary"
                onClick={handleConnect}
                disabled={loadingBtn === 'connect'}
              >
                {loadingBtn === 'connect' ? 'Pending...' : 'Connect Wallet'}
              </button>
            </div>
            <div className="action-card">
              <h3>Connect &amp; Sign</h3>
              <p className="action-desc">Connect and sign a message in one step</p>
              <button
                className="btn btn-secondary"
                onClick={handleConnectSign}
                disabled={loadingBtn === 'connectSign'}
              >
                {loadingBtn === 'connectSign' ? 'Pending...' : 'Connect & Sign'}
              </button>
            </div>
            <div className="action-card">
              <h3>Connect &amp; Send</h3>
              <p className="action-desc">
                Connect and send a transaction in one step: using <code>connectWith</code> method
              </p>
              <button
                className="btn btn-secondary"
                onClick={handleConnectSend}
                disabled={loadingBtn === 'connectSend'}
              >
                {loadingBtn === 'connectSend' ? 'Pending...' : 'Connect & Send'}
              </button>
            </div>
          </div>
        </section>
      )}

      {isConnected && (
        <section className="section">
          <div className="account-card">
            <div className="account-header">
              <span className="status-dot" />
              <span className="status-label">Connected</span>
            </div>
            <div className="account-details">
              <div className="detail-row">
                <span className="detail-label">Account</span>
                <span className="detail-value address" title={account}>
                  {account}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Network</span>
                <div className="chain-switcher" ref={chainSwitcherRef}>
                  <button
                    className="chain-switcher-trigger"
                    onClick={() => setChainDropdownOpen((o) => !o)}
                  >
                    <span>{chainId ? `${getChainName(chainId)} (${chainId})` : '--'}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {chainDropdownOpen && (
                    <div className="chain-dropdown">
                      {SWITCH_CHAINS.map((chain) => (
                        <button
                          key={chain.id}
                          className={`chain-option${chainId === chain.id ? ' active' : ''}`}
                          onClick={() => handleSwitchChain(chain.id)}
                        >
                          <span className="chain-option-name">{chain.name}</span>
                          <span className="chain-option-id">{chain.id}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Balance</span>
                <span className="detail-value">{balance}</span>
              </div>
            </div>
            <button className="btn btn-danger" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        </section>
      )}

      {isConnected && (
        <section className="section">
          <div className="actions-grid-2col">
            <div className="action-card">
              <h3>Sign Message</h3>
              <div className="input-group">
                <label className="input-label" htmlFor="signMsgInput">
                  Message
                </label>
                <input
                  id="signMsgInput"
                  className="input"
                  type="text"
                  value={signMsg}
                  onChange={(e) => setSignMsg(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleSignMessage}
                disabled={loadingBtn === 'signMsg'}
              >
                {loadingBtn === 'signMsg' ? 'Pending...' : 'Sign Message'}
              </button>
            </div>
            <div className="action-card">
              <h3>Send Transaction</h3>
              <div className="input-group">
                <label className="input-label" htmlFor="sendTxTo">
                  To (address)
                </label>
                <input
                  id="sendTxTo"
                  className="input"
                  type="text"
                  value={sendTo}
                  onChange={(e) => setSendTo(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="sendTxValue">
                  Value (ETH)
                </label>
                <input
                  id="sendTxValue"
                  className="input"
                  type="text"
                  value={sendValue}
                  onChange={(e) => setSendValue(e.target.value)}
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={handleSendTransaction}
                disabled={loadingBtn === 'sendTx'}
              >
                {loadingBtn === 'sendTx' ? 'Pending...' : 'Send Transaction'}
              </button>
            </div>
          </div>
        </section>
      )}

      {result && (
        <section className="section">
          <div className="result-card">
            <div className="result-header">
              <span className="result-label">{result.label}</span>
              <button className="btn-icon" onClick={() => setResult(null)} title="Clear">
                &times;
              </button>
            </div>
            <code className="result-value">
              {result.url ? (
                <a href={result.url} target="_blank" rel="noreferrer" className="result-link">
                  {result.value}
                </a>
              ) : (
                result.value
              )}
            </code>
          </div>
        </section>
      )}

      <footer className="footer">
        <a
          href="https://docs.metamask.io/metamask-connect/evm/quickstart/react"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          Documentation
        </a>
        <span className="footer-sep">&middot;</span>
        <a
          href="https://github.com/MetaMask/metamask-connect-examples/tree/main/quickstarts/evm/react"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          Source code
        </a>
      </footer>
    </div>
  )
}

export default App
