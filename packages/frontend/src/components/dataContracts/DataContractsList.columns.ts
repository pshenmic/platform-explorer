export const columnLayout = {
  identifier: { key: 'identifier', header: 'Contract ID', grow: true, minWidth: 160 },
  owner: { key: 'owner', header: 'Owner', grow: true, minWidth: 120 },
  system: { key: 'system', header: 'System', minWidth: 88, align: 'center' },
  withTokens: { key: 'withTokens', header: 'With tokens', minWidth: 152, align: 'center' },
  documents: {
    key: 'documents',
    numeric: true,
    header: 'Documents',
    minWidth: 88,
    align: 'center'
  },
  timestamp: { key: 'timestamp', header: 'Timestamp', minWidth: 128, align: 'right' }
} as const
