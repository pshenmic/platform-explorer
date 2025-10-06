const EventEmitter = require('events')

module.exports = class BlocksPool extends EventEmitter {
  constructor () {
    super()
    this.previousSentBlockHeight = -1
  }

  waitBlockForSent = async (block) => {
    const blockHeight = block.header.height
    const expectedHeight = this.previousSentBlockHeight + 1

    if (this.previousSentBlockHeight === -1 || blockHeight === expectedHeight) {
      this.previousSentBlockHeight = blockHeight

      this.emit(`${blockHeight}`)

      return {
        event: 'block',
        data: JSON.stringify({ block }),
        id: String(blockHeight)
      }
    }

    return new Promise(resolve => {
      this.once(`${expectedHeight}`, async () => {
        const result = await this.waitBlockForSent(block)
        resolve(result)
      })
    })
  }
}
