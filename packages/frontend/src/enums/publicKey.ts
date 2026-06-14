export const SecurityLevelEnum = {
  0: 'MASTER',
  1: 'CRITICAL',
  2: 'HIGH',
  3: 'MEDIUM'
}

export const SecurityLevelInfo = {
  MASTER: {
    title: 'Master',
    colorScheme: 'green'
  },
  CRITICAL: {
    title: 'Critical',
    colorScheme: 'red'
  },
  HIGH: {
    title: 'High',
    colorScheme: 'orange'
  },
  MEDIUM: {
    title: 'Medium',
    colorScheme: 'blue'
  }
}

export const KeyPurposeInfo = {
  AUTHENTICATION: {
    title: 'Authentication',
    colorScheme: 'blue'
  },
  ENCRYPTION: {
    title: 'Encryption',
    colorScheme: 'blue'
  },
  DECRYPTION: {
    title: 'Decryption',
    colorScheme: 'green'
  },
  TRANSFER: {
    title: 'Transfer',
    colorScheme: 'orange'
  },
  SYSTEM: {
    title: 'System',
    colorScheme: 'gray'
  },
  VOTING: {
    title: 'Voting',
    colorScheme: 'orange'
  },
  OWNER: {
    title: 'Owner',
    colorScheme: 'red'
  }
}
