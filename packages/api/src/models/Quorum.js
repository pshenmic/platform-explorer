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
  isCurrent
  members

  constructor (blockHeight, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures, isCurrent) {
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
    this.isCurrent = isCurrent ?? null
    this.blockHeight = blockHeight ?? null
  }

  static fromObject ({ height, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures, isCurrent }) {
    return new Quorum(height, creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures, isCurrent)
  }
}
