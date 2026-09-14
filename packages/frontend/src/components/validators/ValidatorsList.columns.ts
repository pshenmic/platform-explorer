export const columnLayout = {
  identifier: { key: 'identifier', header: 'Validator', grow: true, minWidth: 176 },
  active: { key: 'active', header: 'Active', minWidth: 108 },
  lastBlockHeight: { key: 'lastBlockHeight', numeric: true, header: 'Last height', minWidth: 128 },
  proposedBlocksAmount: {
    key: 'proposedBlocksAmount',
    numeric: true,
    header: 'Blocks proposed',
    minWidth: 120,
    align: 'center'
  },
  timestamp: { key: 'timestamp', header: 'Last block', minWidth: 128, align: 'right' }
} as const
