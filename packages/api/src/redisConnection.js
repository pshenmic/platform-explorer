const Redis = require('ioredis')
const IndexerNotSynchronized = require('./errors/IndexerNotSynchronized')
const { REDIS_PUBSUB_NEW_BLOCK_CHANNEL } = require('./constants')

module.exports = class RedisConnection {
  constructor (redisUrl) {
    this.redis = new Redis(redisUrl)
    this.subscriptions = this.redis.duplicate()
    this.subscriptions.subscribe(REDIS_PUBSUB_NEW_BLOCK_CHANNEL)
  }

  async subscribeMessages (callback) {
    const indexing = (await this.redis.get('indexing')) === 'true'

    if (indexing) {
      throw new IndexerNotSynchronized()
    }

    this.subscriptions.on('message', callback)
  }

  unsubscribeMessages (callback) {
    this.subscriptions.removeListener('message', callback)
  }
}
