import './style.css'
import metamaskLogo from './mm-fox.svg'

import { createEVMClient, getInfuraRpcUrls } from '@metamask/connect-evm'

const CHAIN_NAMES = {
  '0x1': 'Ethereum',
  '0xaa36a7': 'Sepolia',
  '0xe705': 'Linea Sepolia',
  '0x14a34': 'Base Sepolia',
}

const EXPLORER_URLS = {
  '0x1': 'https://etherscan.io',
  '0xaa36a7': 'https://sepolia.etherscan.io',
  '0xe705': 'https://sepolia.lineascan.build',
  '0x14a34': 'https://sepolia.basescan.org',
}

function getChainName(chainId) {
  return CHAIN_NAMES[chainId] || chainId
}

function getTxExplorerUrl(txHash) {
  const chainId = client.getChainId()
  const base = EXPLORER_URLS[chainId]
  if (base) return `${base}/tx/${txHash}`
  return null
}

const client = await createEVMClient({
  dapp: {
    name: 'My MetaMask Connect EVM DApp',
    url: window.location.href,
  },
  api: {
    supportedNetworks: {
      ...getInfuraRpcUrls({
        infuraApiKey: import.meta.env.VITE_INFURA_API_KEY,
        chainIds: ['0x1', '0xaa36a7'],
      }),
      '0xe705': 'https://linea-sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY,
      '0x14a34': 'https://sepolia.base.org',
    },
  },
  ui: {
    headless: false,
    preferExtension: true,
  },
})

const provider = client.getProvider()

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header class="header">
      <a href="https://metamask.io" target="_blank" rel="noreferrer">
        <img src="${metamaskLogo}" class="logo" alt="MetaMask logo" />
      </a>
      <h1>MetaMask Connect EVM JavaScript Quickstart</h1>
      <p class="subtitle">Connect, sign messages, and send transactions</p>
    </header>

    <section id="connectSection" class="section">
      <div class="actions-grid">
        <div class="action-card">
          <h3>Connect</h3>
          <p class="action-desc">Connect your wallet to get started</p>
          <button id="connectBtn" class="btn btn-primary" type="button">Connect Wallet</button>
        </div>
        <div class="action-card">
          <h3>Connect & Sign</h3>
          <p class="action-desc">Connect and sign a message in one step</p>
          <button id="connectSignBtn" class="btn btn-secondary" type="button">Connect & Sign</button>
        </div>
        <div class="action-card">
          <h3>Connect & Send</h3>
          <p class="action-desc">Connect and send a transaction in one step: using <code>connectWith</code> method</p>
          <button id="connectSendBtn" class="btn btn-secondary" type="button">Connect & Send</button>
        </div>
      </div>
    </section>

    <section id="accountSection" class="section" style="display: none;">
      <div class="account-card">
        <div class="account-header">
          <span class="status-dot"></span>
          <span class="status-label">Connected</span>
        </div>
        <div class="account-details">
          <div class="detail-row">
            <span class="detail-label">Account</span>
            <span class="detail-value address" id="accountAddress"></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Network</span>
            <div class="chain-switcher">
              <button id="chainSwitcherBtn" class="chain-switcher-trigger" type="button">
                <span id="chainName"></span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <div id="chainDropdown" class="chain-dropdown" style="display: none;">
                <button class="chain-option" data-chain-id="0x1" type="button">
                  <span class="chain-option-name">Ethereum</span>
                  <span class="chain-option-id">0x1</span>
                </button>
                <button class="chain-option" data-chain-id="0xaa36a7" type="button">
                  <span class="chain-option-name">Sepolia</span>
                  <span class="chain-option-id">0xaa36a7</span>
                </button>
                <button class="chain-option" data-chain-id="0xe705" type="button">
                  <span class="chain-option-name">Linea Sepolia</span>
                  <span class="chain-option-id">0xe705</span>
                </button>
                <button class="chain-option" data-chain-id="0x14a34" type="button">
                  <span class="chain-option-name">Base Sepolia</span>
                  <span class="chain-option-id">0x14a34</span>
                </button>
              </div>
            </div>
          </div>
          <div class="detail-row">
            <span class="detail-label">Balance</span>
            <span class="detail-value" id="balance">--</span>
          </div>
        </div>
        <button id="disconnectBtn" class="btn btn-danger" type="button">Disconnect</button>
      </div>
    </section>

    <section id="actionsSection" class="section" style="display: none;">
      <div class="actions-grid-2col">
        <div class="action-card">
          <h3>Sign Message</h3>
          <div class="input-group">
            <label class="input-label" for="signMsgInput">Message</label>
            <input id="signMsgInput" class="input" type="text" value="Sign in to MetaMask Connect EVM dapp" />
          </div>
          <button id="signMsgBtn" class="btn btn-secondary" type="button">Sign Message</button>
        </div>
        <div class="action-card">
          <h3>Send Transaction</h3>
          <div class="input-group">
            <label class="input-label" for="sendTxTo">To (address)</label>
            <input id="sendTxTo" class="input" type="text" value="0x88Be81032970baDD93DBfB801039fbdA51dfb836" />
          </div>
          <div class="input-group">
            <label class="input-label" for="sendTxValue">Value (ETH)</label>
            <input id="sendTxValue" class="input" type="text" value="0.01" />
          </div>
          <button id="sendTxBtn" class="btn btn-secondary" type="button">Send Transaction</button>
        </div>
      </div>
    </section>

    <section id="resultSection" class="section" style="display: none;">
      <div class="result-card">
        <div class="result-header">
          <span class="result-label" id="resultLabel"></span>
          <button id="clearResultBtn" class="btn-icon" type="button" title="Clear">&times;</button>
        </div>
        <code class="result-value" id="resultValue"></code>
      </div>
    </section>

    <footer class="footer">
      <a href="https://docs.metamask.io/metamask-connect/evm/quickstart/javascript" target="_blank" rel="noreferrer" class="footer-link">
        Documentation
      </a>
      <span class="footer-sep">·</span>
      <a href="https://github.com/MetaMask/metamask-connect-examples/tree/main/quickstarts/evm/javascript" target="_blank" rel="noreferrer" class="footer-link">
        Source code
      </a>
    </footer>
  </div>
`

const connectSection = document.querySelector('#connectSection')
const accountSection = document.querySelector('#accountSection')
const actionsSection = document.querySelector('#actionsSection')
const resultSection = document.querySelector('#resultSection')
const accountAddress = document.querySelector('#accountAddress')
const chainNameEl = document.querySelector('#chainName')
const balanceEl = document.querySelector('#balance')
const resultLabel = document.querySelector('#resultLabel')
const resultValue = document.querySelector('#resultValue')

const connectBtn = document.querySelector('#connectBtn')
const connectSignBtn = document.querySelector('#connectSignBtn')
const connectSendBtn = document.querySelector('#connectSendBtn')
const disconnectBtn = document.querySelector('#disconnectBtn')
const clearResultBtn = document.querySelector('#clearResultBtn')
const signMsgBtn = document.querySelector('#signMsgBtn')
const signMsgInput = document.querySelector('#signMsgInput')
const sendTxBtn = document.querySelector('#sendTxBtn')
const sendTxTo = document.querySelector('#sendTxTo')
const sendTxValue = document.querySelector('#sendTxValue')
const chainSwitcherBtn = document.querySelector('#chainSwitcherBtn')
const chainDropdown = document.querySelector('#chainDropdown')
const chainOptions = document.querySelectorAll('.chain-option')

async function fetchBalance(account) {
  try {
    const wei = await provider.request({
      method: 'eth_getBalance',
      params: [account, 'latest'],
    })
    const ethBalance = Number(BigInt(wei)) / 1e18
    balanceEl.textContent = `${ethBalance.toFixed(4)} ETH`
  } catch {
    balanceEl.textContent = '--'
  }
}

function updateChainDisplay(chainId) {
  chainNameEl.textContent = chainId ? `${getChainName(chainId)} (${chainId})` : '--'
  chainOptions.forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.chainId === chainId)
  })
}

function showConnected(account, chainId) {
  connectSection.style.display = 'none'
  accountSection.style.display = 'block'
  actionsSection.style.display = 'block'
  accountAddress.textContent = account
  accountAddress.title = account
  updateChainDisplay(chainId)
  fetchBalance(account)
}

function showDisconnected() {
  connectSection.style.display = 'block'
  accountSection.style.display = 'none'
  actionsSection.style.display = 'none'
  resultSection.style.display = 'none'
  accountAddress.textContent = ''
  chainNameEl.textContent = '--'
  balanceEl.textContent = '--'
}

function showResult(label, value, url) {
  resultSection.style.display = 'block'
  resultLabel.textContent = label
  resultValue.textContent = ''
  if (url) {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.className = 'result-link'
    link.textContent = value
    resultValue.appendChild(link)
  } else {
    resultValue.textContent = value
  }
}

function setLoading(button, loading, defaultText) {
  button.disabled = loading
  button.textContent = loading ? 'Pending...' : defaultText
}

function handleError(error) {
  if (error.code === 4001) {
    console.error('Request rejected by user')
  } else if (error.code === -32002) {
    console.error('Request already pending')
  } else {
    console.error(error)
  }
}

provider.on('accountsChanged', (accounts) => {
  if (accounts.length === 0) {
    showDisconnected()
    return
  }
  const chainId = client.getChainId()
  showConnected(accounts[0], chainId)
})

provider.on('chainChanged', (chainId) => {
  const account = client.getAccount()
  if (account) {
    updateChainDisplay(chainId)
    fetchBalance(account)
  }
})

provider.on('disconnect', () => {
  showDisconnected()
})

connectBtn.addEventListener('click', async () => {
  setLoading(connectBtn, true)
  try {
    const { accounts, chainId } = await client.connect({
      chainIds: ['0xaa36a7', '0xe705', '0x14a34'],
    })
    showConnected(accounts[0], chainId)
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(connectBtn, false, 'Connect Wallet')
  }
})

connectSignBtn.addEventListener('click', async () => {
  setLoading(connectSignBtn, true)
  try {
    const signature = await client.connectAndSign({
      message: 'Sign in to MetaMask Connect EVM dapp',
      chainIds: ['0xaa36a7'],
    })
    const account = client.getAccount()
    const chainId = client.getChainId()
    showConnected(account, chainId)
    showResult('Signature', signature)
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(connectSignBtn, false, 'Connect & Sign')
  }
})

connectSendBtn.addEventListener('click', async () => {
  setLoading(connectSendBtn, true)
  try {
    const txHash = await client.connectWith({
      method: 'eth_sendTransaction',
      params: (account) => [
        {
          from: account,
          to: account,
          value: '0x0',
        },
      ],
      chainIds: ['0xaa36a7'],
    })
    const account = client.getAccount()
    const chainId = client.getChainId()
    showConnected(account, chainId)
    showResult('Transaction Hash', txHash, getTxExplorerUrl(txHash))
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(connectSendBtn, false, 'Connect & Send')
  }
})

disconnectBtn.addEventListener('click', async () => {
  try {
    await client.disconnect()
    showDisconnected()
  } catch (error) {
    console.error(error)
  }
})

clearResultBtn.addEventListener('click', () => {
  resultSection.style.display = 'none'
})

signMsgBtn.addEventListener('click', async () => {
  const account = client.getAccount()
  if (!account) return
  setLoading(signMsgBtn, true)
  try {
    const msg = signMsgInput.value || 'Hello from My DApp'
    const hexMsg =
      '0x' +
      Array.from(new TextEncoder().encode(msg))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    const signature = await provider.request({
      method: 'personal_sign',
      params: [hexMsg, account],
    })
    showResult('Signature', signature)
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(signMsgBtn, false, 'Sign Message')
  }
})

sendTxBtn.addEventListener('click', async () => {
  const account = client.getAccount()
  if (!account) return
  setLoading(sendTxBtn, true)
  try {
    const to = sendTxTo.value.trim() || account
    const ethValue = parseFloat(sendTxValue.value) || 0
    const weiValue = BigInt(Math.round(ethValue * 1e18))
    const hexValue = '0x' + weiValue.toString(16)
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{ from: account, to, value: hexValue }],
    })
    showResult('Transaction Hash', txHash, getTxExplorerUrl(txHash))
  } catch (error) {
    handleError(error)
  } finally {
    setLoading(sendTxBtn, false, 'Send Transaction')
  }
})

chainSwitcherBtn.addEventListener('click', () => {
  const isOpen = chainDropdown.style.display !== 'none'
  chainDropdown.style.display = isOpen ? 'none' : 'block'
})

document.addEventListener('click', (e) => {
  if (!e.target.closest('.chain-switcher')) {
    chainDropdown.style.display = 'none'
  }
})

const CHAIN_CONFIGS = {
  '0x1': {
    chainName: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  '0xaa36a7': {
    chainName: 'Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  '0xe705': {
    chainName: 'Linea Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://linea-sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY],
    blockExplorerUrls: ['https://sepolia.lineascan.build'],
  },
  '0x14a34': {
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://base-sepolia.infura.io/v3/' + import.meta.env.VITE_INFURA_API_KEY],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
}

chainOptions.forEach((opt) => {
  opt.addEventListener('click', async () => {
    const targetChainId = opt.dataset.chainId
    chainDropdown.style.display = 'none'
    try {
      const switchOpts = { chainId: targetChainId }
      if (CHAIN_CONFIGS[targetChainId]) {
        switchOpts.chainConfiguration = CHAIN_CONFIGS[targetChainId]
      }
      await client.switchChain(switchOpts)
    } catch (error) {
      handleError(error)
    }
  })
})
