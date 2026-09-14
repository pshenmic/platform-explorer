export const columnLayout = {
  height: { key: 'height', numeric: true, header: 'Height', minWidth: 108 },
  hash: { key: 'hash', header: 'Block Hash', grow: true, minWidth: 160 },
  epoch: { key: 'epoch', numeric: true, header: 'Epoch', minWidth: 88, align: 'center' },
  validator: { key: 'validator', header: 'Validator', grow: true, minWidth: 160 },
  gas: { key: 'gas', numeric: true, header: 'Gas', minWidth: 88, align: 'center' },
  txs: { key: 'txs', numeric: true, header: 'TX count', minWidth: 118, align: 'center' },
  timestamp: { key: 'timestamp', header: 'Timestamp', minWidth: 128, align: 'right' }
} as const
