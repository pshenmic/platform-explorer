module.exports = class Token {
  amount
  recipient
  owner
  action
  stateTransitionHash
  timestamp
  publicNote

  constructor (action, amount, stateTransitionHash, recipient, timestamp, publicNote, owner) {
    this.amount = amount ?? null
    this.recipient = recipient ?? null
    this.owner = owner ?? null
    this.action = action ?? null
    this.stateTransitionHash = stateTransitionHash ?? null
    this.timestamp = timestamp ?? null
    this.publicNote = publicNote ?? null
  }

  /* eslint-disable */
  static fromRow ({action, amount, state_transition_hash, recipient, timestamp, public_note, owner}) {
    return new Token(action, Number(amount), state_transition_hash, recipient, timestamp, public_note, owner)
  }
}
