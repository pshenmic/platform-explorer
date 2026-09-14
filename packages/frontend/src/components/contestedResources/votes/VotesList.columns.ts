export const columnLayout = {
  voter: { key: 'voter', header: 'Voter', grow: true, minWidth: 148 },
  choice: { key: 'choice', header: 'Choice', minWidth: 148 },
  document: { key: 'document', header: 'Resource', grow: true, minWidth: 140 },
  towards: { key: 'towards', header: 'Towards Identity', grow: true, minWidth: 148 },
  power: { key: 'power', numeric: true, header: 'Power', minWidth: 88, align: 'center' },
  contract: { key: 'contract', header: 'Contract ID', grow: true, minWidth: 140 },
  timestamp: { key: 'timestamp', header: 'Timestamp', minWidth: 128, align: 'right' }
} as const
