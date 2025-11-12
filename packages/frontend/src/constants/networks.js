export const NETWORKS_ENUM = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
}

export const NETWORK_OPTIONS = {
  [NETWORKS_ENUM.MAINNET]: {
    name: NETWORKS_ENUM.MAINNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: 'https://platform-explorer.com',
    l1explorerBaseUrl: 'https://insight.dash.org/insight'
  },
  [NETWORKS_ENUM.TESTNET]: {
    name: NETWORKS_ENUM.TESTNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: 'https://testnet.platform-explorer.com',
    l1explorerBaseUrl: 'http://insight.testnet.networks.dash.org/insight'
  }
}

export const networks = [
  {
    name: NETWORKS_ENUM.MAINNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: 'https://platform-explorer.com',
    l1explorerBaseUrl: 'https://insight.dash.org/insight'
  },
  {
    name: NETWORKS_ENUM.TESTNET,
    subname: '',
    disabled: false,
    explorerBaseUrl: 'https://testnet.platform-explorer.com',
    l1explorerBaseUrl: 'http://insight.testnet.networks.dash.org/insight'
  }
]
