module.exports = class Quorum {
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

  constructor (creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures) {
    this.creationHeight = creationHeight
    this.minedBlockHash = minedBlockHash
    this.numValidMembers = numValidMembers
    this.healthRatio = healthRatio
    this.type = type ?? null
    this.quorumHash = quorumHash ?? null
    this.quorumIndex = quorumIndex ?? null
    this.members = members ?? null
    this.quorumPublicKey = quorumPublicKey ?? null
    this.previousConsecutiveDKGFailures = previousConsecutiveDKGFailures ?? null
  }

  static fromObject ({ creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures }) {
    return new Quorum(creationHeight, minedBlockHash, numValidMembers, healthRatio, type, quorumHash, quorumIndex, members, quorumPublicKey, previousConsecutiveDKGFailures)
  }
}
