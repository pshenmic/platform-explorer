export const columnLayout = {
  identifier: { key: 'identifier', header: 'Identity', grow: true, minWidth: 168 },
  type: { key: 'type', header: 'Type', minWidth: 120 },
  balance: { key: 'balance', numeric: true, header: 'Balance', minWidth: 96 },
  txs: { key: 'txs', numeric: true, header: 'Transactions', minWidth: 108, align: 'center' },
  documents: {
    key: 'documents',
    numeric: true,
    header: 'Documents',
    minWidth: 108,
    align: 'center'
  },
  contracts: {
    key: 'contracts',
    numeric: true,
    header: 'Data Contracts',
    minWidth: 120,
    align: 'center'
  },
  timestamp: { key: 'timestamp', header: 'Timestamp', minWidth: 128, align: 'right' }
} as const
