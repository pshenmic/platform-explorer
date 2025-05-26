module.exports = class Quorum {
  blockHeight
  creationHeight
  minedBlockHash
  numValidMembers
  healthRatio
  type
  quorumHash
  quorumIndex
  quorumPublicKey
  previousConsecutiveDKGFailures
  members

  constructor (blockHeight, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures) {
    this.creationHeight = creationHeight ?? null
    this.minedBlockHash = minedBlockHash ?? null
    this.numValidMembers = numValidMembers ?? null
    this.healthRatio = healthRatio ?? null
    this.type = type ?? null
    this.quorumHash = quorumHash ?? null
    this.quorumIndex = quorumIndex ?? null
    this.members = members ?? null
    this.quorumPublicKey = quorumPublicKey ?? null
    this.previousConsecutiveDKGFailures = previousConsecutiveDKGFailures ?? null
    this.blockHeight = blockHeight ?? null
  }

  static fromObject ({ height, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures }) {
    return new Quorum(height, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures)
  }
}
