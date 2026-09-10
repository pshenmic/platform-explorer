export const columnLayout = {
  resourceValue: { key: 'resourceValue', header: 'Resource Value', grow: true, minWidth: 168 },
  status: { key: 'status', header: 'Status', minWidth: 104, align: 'center' },
  timestamp: { key: 'timestamp', header: 'Timestamp', align: 'right', minWidth: 128 },
  contract: { key: 'contract', header: 'Contract ID', grow: true, minWidth: 148 },
  indexName: { key: 'indexName', header: 'Index name', minWidth: 168 },
  documentType: { key: 'documentType', header: 'Document type', minWidth: 132 },
  votes: { key: 'votes', numeric: true, header: 'Votes', minWidth: 120 },
  endsIn: { key: 'endsIn', header: 'Ends', minWidth: 96, align: 'right' }
} as const
