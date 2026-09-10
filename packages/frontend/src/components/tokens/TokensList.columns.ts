export const columnLayout = {
  tokenName: { key: 'tokenName', header: 'Token Name', grow: true, minWidth: 160 },
  position: { key: 'position', numeric: true, header: 'Position', minWidth: 88, align: 'center' },
  supply: { key: 'supply', numeric: true, header: 'Supply', minWidth: 108 },
  price: { key: 'price', numeric: true, header: 'Price', minWidth: 96 },
  contract: { key: 'contract', header: 'Contract', grow: true, minWidth: 130 },
  owner: { key: 'owner', header: 'Owner', grow: true, minWidth: 130 },
  balance: { key: 'balance', numeric: true, header: 'Balance', minWidth: 100, align: 'right' }
} as const
