export const SecurityLevelEnum = {
  0: 'MASTER',
  1: 'CRITICAL',
  2: 'HIGH',
  3: 'MEDIUM'
}

export const SecurityLevelTitle = {
  MASTER: 'Master',
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium'
}

export const KeyTypeEnum = {
  0: 'ECDSA_SECP256K1',
  1: 'BLS12_381',
  2: 'ECDSA_HASH160',
  3: 'BIP13_SCRIPT_HASH',
  4: 'EDDSA_25519_HASH160'
}

export const KeyPurposeEnum = {
  0: 'AUTHENTICATION',
  1: 'ENCRYPTION',
  2: 'DECRYPTION',
  3: 'TRANSFER',
  4: 'SYSTEM',
  5: 'VOTING',
  6: 'OWNER'
}

export const KeyPurposeTitle = {
  AUTHENTICATION: 'Authentication',
  ENCRYPTION: 'Encryption',
  DECRYPTION: 'Decryption',
  TRANSFER: 'Transfer',
  SYSTEM: 'System',
  VOTING: 'Voting',
  OWNER: 'Owner'
}
