const PlatformAddress = require("../models/PlatformAddress");
module.exports = class PlatformAddressesDAO {
  constructor(knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  getPlatformAddressInfo = async (address) => {
    const addressSubquery = this.knex('platform_addresses')
      .select('id', 'address', 'bech32m_address')
      .whereRaw('LOWER(address) = ?', [address.toLowerCase()])
      .orWhereRaw('LOWER(bech32m_address) = ?', [address.toLowerCase()])
      .limit(1)

    const unionTransitions = this.knex
      .with('address_subquery', addressSubquery)
      .unionAll([
        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.sender_id', 'address_subquery.id')
          .select(
            'state_transition_id',
            this.knex.raw('0 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('state_transition_id'),

        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.recipient_id', 'address_subquery.id')
          .select(
            'state_transition_id',
            this.knex.raw('1 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('state_transition_id')
      ])

    const [row] = await this.knex('address_subquery')
      .with('address_subquery', addressSubquery)
      .with('unique_transitions', unionTransitions)
      .select('address as base58_address', 'bech32m_address')
      .select('txs_count.total_txs as total_txs', 'txs_count.incoming_txs as incoming_txs', 'txs_count.outgoing_txs as outgoing_txs',
        'txs_count.total_incoming_amount as total_incoming_amount', 'txs_count.total_outgoing_amount as total_outgoing_amount')
      .leftJoin(
        this.knex('unique_transitions')
          .select(
            this.knex.raw('count(*) as total_txs'),
            this.knex.raw('count(*) FILTER (WHERE incoming = 1) as incoming_txs'),
            this.knex.raw('count(*) FILTER (WHERE incoming = 0) as outgoing_txs'),
            this.knex.raw('SUM(amount) FILTER (WHERE incoming = 1) as total_incoming_amount'),
            this.knex.raw('SUM(amount) FILTER (WHERE incoming = 0) as total_outgoing_amount')
          )
          .as('txs_count'),
        this.knex.raw('1 = 1')
      )

    if (!row) {
      return null
    }

    const platformAddressInfo = PlatformAddress.fromRow(row)

    const platformAddressInfoWithBalance = await this.sdk.platformAddresses.getAddressInfo(platformAddressInfo.bech32mAddress)

    return PlatformAddress.fromObject({
      ...platformAddressInfo,
      nonce: platformAddressInfoWithBalance.nonce,
      balance: platformAddressInfoWithBalance.balance.toString(),
    })
  }
}