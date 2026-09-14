export const columnLayout = {
  hash: { key: 'hash', header: 'Hash', grow: true, minWidth: 160 },
  status: { key: 'status', header: 'Status', minWidth: 96, align: 'center' },
  type: { key: 'type', header: 'Type', minWidth: 140 },
  block: { key: 'block', numeric: true, header: 'Block', minWidth: 88 },
  gasUsed: { key: 'gasUsed', numeric: true, header: 'Gas', minWidth: 88, align: 'center' },
  owner: { key: 'owner', header: 'Owner', grow: true, minWidth: 120 },
  timestamp: { key: 'timestamp', header: 'Timestamp', minWidth: 128, align: 'right' }
} as const
