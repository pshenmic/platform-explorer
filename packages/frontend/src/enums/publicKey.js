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
//todo: check is need?
export const KeyTypeEnum = {
  0: 'ECDSA_SECP256K1',
  1: 'BLS12_381',
  2: 'ECDSA_HASH160',
  3: 'BIP13_SCRIPT_HASH',
  4: 'EDDSA_25519_HASH160'
}

//todo: check is need?
export const KeyPurposeEnum = {
  0: 'AUTHENTICATION',
  1: 'ENCRYPTION',
  2: 'DECRYPTION',
  3: 'TRANSFER',
  4: 'SYSTEM',
  5: 'VOTING',
  6: 'OWNER'
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
