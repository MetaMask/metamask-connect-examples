import { useEffect, useRef, useState } from 'react'
import {
  useConnection,
  useBalance,
  useChains,
  useConnect,
  useConnectors,
  useDisconnect,
  useSignMessage,
  useSendTransaction,
  useSwitchChain,
} from 'wagmi'
import { formatUnits, parseEther } from 'viem'

import { handleError, type Result } from './utils.ts'

import metaMaskLogo from './assets/mm-fox.svg'
import './App.css'

function toHexChainId(id: number): string {
  return '0x' + id.toString(16)
}

function App() {
  const { address, isConnected, chainId } = useConnection()
  const { data: balanceData } = useBalance({ address })
  const connectors = useConnectors()
  const connect = useConnect()
  const disconnect = useDisconnect()
  const chains = useChains()
  const switchChain = useSwitchChain()
  const signMessage = useSignMessage()
  const sendTx = useSendTransaction()

  const [result, setResult] = useState<Result | null>(null)
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)

  const [signMsg, setSignMsg] = useState('Sign in to My MetaMask Connect EVM dapp')
  const [sendTo, setSendTo] = useState('0x88Be81032970baDD93DBfB801039fbdA51dfb836')
  const [sendValue, setSendValue] = useState('0.01')

  const chainSwitcherRef = useRef<HTMLDivElement>(null)

  const currentChain = chains.find((c) => c.id === chainId)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chainSwitcherRef.current && !chainSwitcherRef.current.contains(e.target as Node)) {
        setChainDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleConnect = async () => {
    setLoadingBtn('connect')
    try {
      console.log('connectors', connectors)
      const connector = connectors.find((c) => c.id === 'metaMaskSDK') ?? connectors[0]
      await connect.mutateAsync({ connector })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }

  const handleDisconnect = () => {
    disconnect.mutate()
    setResult(null)
  }

  const handleSignMessage = async () => {
    if (!address) return
    setLoadingBtn('signMsg')
    try {
      const msg = signMsg || 'Hello from My DApp'
      const signature = await signMessage.mutateAsync({ message: msg })
      setResult({ label: 'Signature', value: signature })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }

  const handleSendTransaction = async () => {
    if (!address) return
    setLoadingBtn('sendTx')
    try {
      const to = (sendTo.trim() || address) as `0x${string}`
      const hash = await sendTx.mutateAsync({
        to,
        value: parseEther(sendValue || '0'),
      })
      const explorerUrl = currentChain?.blockExplorers?.default?.url
      setResult({
        label: 'Transaction Hash',
        value: hash,
        url: explorerUrl ? `${explorerUrl}/tx/${hash}` : undefined,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setLoadingBtn(null)
    }
  }

  const handleSwitchChain = (targetChainId: number) => {
    setChainDropdownOpen(false)
    try {
      switchChain.mutate({ chainId: targetChainId as (typeof chains)[number]['id'] })
    } catch (error) {
      handleError(error)
    }
  }

  const balanceDisplay = balanceData
    ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)} ${balanceData.symbol}`
    : '--'

  return (
    <div className="container">
      <header className="header">
        <a href="https://metamask.io" target="_blank" rel="noreferrer">
          <img src={metaMaskLogo} className="logo" alt="MetaMask logo" />
        </a>
        <h1>MetaMask Connect x Wagmi Quickstart</h1>
        <p className="subtitle">Connect, sign messages, and send transactions</p>
      </header>

      {!isConnected && (
        <section className="section">
          <div className="action-card" style={{ maxWidth: '360px', margin: '0 auto' }}>
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
                <span className="detail-value address" title={address}>
                  {address}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Network</span>
                <div className="chain-switcher" ref={chainSwitcherRef}>
                  <button
                    className="chain-switcher-trigger"
                    onClick={() => setChainDropdownOpen((o) => !o)}
                  >
                    <span>
                      {currentChain
                        ? `${currentChain.name} (${toHexChainId(currentChain.id)})`
                        : '--'}
                    </span>
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
                      {chains.map((chain) => (
                        <button
                          key={chain.id}
                          className={`chain-option${chainId === chain.id ? ' active' : ''}`}
                          onClick={() => handleSwitchChain(chain.id)}
                        >
                          <span className="chain-option-name">{chain.name}</span>
                          <span className="chain-option-id">{toHexChainId(chain.id)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Balance</span>
                <span className="detail-value">{balanceDisplay}</span>
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
          href="https://docs.metamask.io/metamask-connect/evm/quickstart/wagmi"
          target="_blank"
          rel="noreferrer"
          className="footer-link"
        >
          Documentation
        </a>
        <span className="footer-sep">&middot;</span>
        <a
          href="https://github.com/MetaMask/metamask-connect-examples/tree/main/integrations/wagmi/"
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
