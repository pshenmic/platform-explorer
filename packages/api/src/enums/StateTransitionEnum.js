const StateTransitionEnum = {
  DATA_CONTRACT_CREATE: 0,
  DOCUMENTS_BATCH: 1,
  IDENTITY_CREATE: 2,
  IDENTITY_TOP_UP: 3,
  DATA_CONTRACT_UPDATE: 4,
  IDENTITY_UPDATE: 5,
  IDENTITY_CREDIT_WITHDRAWAL: 6,
  IDENTITY_CREDIT_TRANSFER: 7
}

module.exports = StateTransitionEnum

const types = [
  {
    type: StateTransitionEnum.IDENTITY_CREATE,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    assetLockProof: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreTransactionHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreTransactionIndex: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreFundingAddress: 'Xeh4Jxvqe7QqMLnqDVzca8Cb9SDkAwjevA',
    publicKeys: [{
      type: 'ECDSA_SECP256K1',
      purpose: 'AUTHENTICATION',
      securityLevel: 'MASTER',
    }],
    readOnly: false,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'

  },
  {
    type: StateTransitionEnum.DATA_CONTRACT_CREATE,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    dataContractIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    version: 1,
    ownerIdentityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    ownerIdentityNonce: 1,
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
  },
  {
    type: StateTransitionEnum.DOCUMENTS_BATCH,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    ownerIdentityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    transitions: [{
      type: 'CREATE',
      dataContractIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
      data: {},
      identityContractNonce: 1,
      documentTypeName: 'domain'
    }],
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef'
  },
  {
    type: StateTransitionEnum.IDENTITY_TOP_UP,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    identityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    assetLockProof: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreTransactionHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreTransactionIndex: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    coreFundingAddress: 'Xeh4Jxvqe7QqMLnqDVzca8Cb9SDkAwjevA',
    amount: 100,
    user_fee_increase: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  },
  {
    type: StateTransitionEnum.DATA_CONTRACT_UPDATE,
    txHash: 'deaddeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefbeef',
    identityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    dataContractIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    schema: {},
    version: 1,
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  },
  {
    type: StateTransitionEnum.IDENTITY_UPDATE,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    identityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    revision: 1,
    nonce: 1,
    addPublicKeys: [{
      type: 'ECDSA_SECP256K1',
      purpose: 'AUTHENTICATION',
      securityLevel: 'MASTER'
    }],
    disablePublicKeys: [{
      type: 'ECDSA_SECP256K1',
      purpose: 'AUTHENTICATION',
      securityLevel: 'MASTER'
    }],
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  },
  {
    type: StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    identityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    amount: 100,
    coreFeePerByte: 1,
    pooling: 'Never',
    outputScript: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    outputAddress: 'Xeh4Jxvqe7QqMLnqDVzca8Cb9SDkAwjevA',
    nonce: 1,
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  },
  {
    type: StateTransitionEnum.IDENTITY_CREDIT_TRANSFER,
    txHash: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
    senderIdentityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    recipientIdentityIdentifier: '56ERNPj9axVQCgahnxyKaiR5BXENvTMxQrmVSnZGj56X',
    amount: 100,
    nonce: 1,
    userFeeIncrease: 1,
    signature: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  }
]
