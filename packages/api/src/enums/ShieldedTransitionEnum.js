const StateTransitionEnum = require('./StateTransitionEnum')

const ShieldedDirectionEnum = {
  IN: 'IN',
  OUT: 'OUT',
  TRANSFER: 'TRANSFER'
}

// transitions that move value into the shielded pool
const SHIELD_IN_TYPES = [
  StateTransitionEnum.SHIELD,
  StateTransitionEnum.SHIELD_FROM_ASSET_LOCK
]

// transitions that move value out of the shielded pool
const SHIELD_OUT_TYPES = [
  StateTransitionEnum.UNSHIELD,
  StateTransitionEnum.SHIELDED_WITHDRAWAL,
  StateTransitionEnum.IDENTITY_CREATE_FROM_SHIELDED_POOL
]

// transitions that stay inside the shielded pool
const SHIELD_TRANSFER_TYPES = [
  StateTransitionEnum.SHIELDED_TRANSFER
]

const getShieldedDirection = (type) => {
  if (SHIELD_IN_TYPES.includes(type)) {
    return ShieldedDirectionEnum.IN
  }

  if (SHIELD_OUT_TYPES.includes(type)) {
    return ShieldedDirectionEnum.OUT
  }

  if (SHIELD_TRANSFER_TYPES.includes(type)) {
    return ShieldedDirectionEnum.TRANSFER
  }

  return null
}

module.exports = {
  ShieldedDirectionEnum,
  SHIELD_IN_TYPES,
  SHIELD_OUT_TYPES,
  SHIELD_TRANSFER_TYPES,
  getShieldedDirection
}
