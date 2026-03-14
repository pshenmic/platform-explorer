const PlatformAddress = require("../models/PlatformAddress");
const {NETWORK} = require("../constants");
const PaginatedResultSet = require("../models/PaginatedResultSet");
const Transaction = require("../models/Transaction");
const {getAliasDocumentForIdentifiers, getAliasFromDocument} = require("../utils");
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

  getPlatformAddresses = async (page, limit, order) => {
    const fromRank = (page - 1) * limit

    const countSubquery = this.knex
      .select(
        this.knex('platform_addresses')
          .count('*')
          .as('total_count')
      )

    const rows = await this.knex('platform_addresses')
      .with('count_subquery', countSubquery)
      .select('address as base58_address', 'bech32m_address')
      .select(this.knex('count_subquery').select('total_count').as('total_count'))
      .orderBy('id', order)
      .offset(fromRank)
      .limit(limit)

    const platformAddresses = rows.map(PlatformAddress.fromRow)
    const bech32mAddresses = platformAddresses.map(address => address.bech32mAddress)

    const addressesInfo = await this.sdk.platformAddresses.getAddressesInfos(bech32mAddresses)
    const addressesInfoJSON = Object.fromEntries(
      addressesInfo.map(info => (
        [info.address.toBech32m(NETWORK), {
          nonce: info.nonce,
          balance: info.balance.toString(),
        }]))
    )

    const resultSet = platformAddresses.map(addr => {
      const addressInfo = addressesInfoJSON[addr.bech32mAddress]

      return PlatformAddress.fromObject({
        ...addr,
        balance: addressInfo?.balance ?? undefined,
        nonce: addressInfo?.nonce ?? undefined,
      })
    })

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count))
  }

  getPlatformAddressTransitions = async (platformAddress, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const addressSubquery = this.knex('platform_addresses')
      .select('id', 'address', 'bech32m_address')
      .whereRaw('LOWER(address) = ?', [platformAddress.toLowerCase()])
      .orWhereRaw('LOWER(bech32m_address) = ?', [platformAddress.toLowerCase()])
      .limit(1)
      .as('address_subquery')

    const transitionsSubquery = this.knex(addressSubquery)
      .select('address', 'bech32m_address', 'state_transition_id', 'recipient_id', 'sender_id')
      .leftJoin('platform_address_transitions', function () {
        this
          .on('platform_address_transitions.recipient_id', '=', 'address_subquery.id')
          .orOn('platform_address_transitions.sender_id', '=', 'address_subquery.id')
      })

    const countSubquery = this.knex
      .select(
        this.knex('transitions_subquery')
          .count('*')
          .as('total_count')
      )

    const transitionsSubqueryWithTotalCount = this.knex
      .with('transitions_subquery', transitionsSubquery)
      .select('address', 'bech32m_address', 'state_transition_id')
      .select(this.knex.raw('recipient_id is not null as incoming'))
      .select(countSubquery.as('total_count'))
      .orderBy('state_transition_id', order)
      .offset(fromRank)
      .limit(limit)
      .from('transitions_subquery')
      .as('transitions_with_total_count_subquery')

    const rows = await this.knex(transitionsSubqueryWithTotalCount)
      .select('state_transitions.hash as tx_hash', 'index', 'block_hash', 'type',
        'gas_used', 'status', 'gas_used', 'owner', 'data', 'incoming', 'total_count',
        'blocks.timestamp as timestamp', 'blocks.height as block_height',
        'address as base58_address', 'bech32m_address', 'state_transition_id')
      .leftJoin('state_transitions', 'state_transitions.id', 'state_transition_id')
      .leftJoin('blocks', 'state_transitions.block_height', 'blocks.height')

    const identifiers = rows.filter(row=>row.owner!=null).map(row => row.owner?.trim())

    const aliasDocuments = await getAliasDocumentForIdentifiers(identifiers, this.sdk)

    const resultSet = rows.map(row => {
      const aliasDocument = aliasDocuments[row.owner?.trim()]

      const aliases = []

      if (aliasDocument) {
        aliases.push(getAliasFromDocument(aliasDocument))
      }

      return Transaction.fromRow({
        ...row,
        owner: row.owner,
        aliases
      })
    })

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count))
  }
}