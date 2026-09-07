const PlatformAddress = require('../models/PlatformAddress')
const { NETWORK } = require('../constants')
const PaginatedResultSet = require('../models/PaginatedResultSet')
const Transaction = require('../models/Transaction')
const { getAliasDocumentForIdentifiers, getAliasFromDocument } = require('../utils')
const StateTransitionEnum = require('../enums/StateTransitionEnum')
module.exports = class PlatformAddressesDAO {
  constructor (knex, sdk) {
    this.knex = knex
    this.sdk = sdk
  }

  // matches a set of base58 or bech32m addresses against the platform_addresses table. Both
  // the single and the batch endpoints anchor on this, so they agree on what an address is.
  // Each half compares the column itself so it can use the plain index on that column:
  // base58check is case sensitive, and bech32m is stored canonically lowercased, so only the
  // input needs folding. Wrapping a column in LOWER() instead costs a sequential scan over
  // every address ever seen, on every request
  addressSubquery = (addresses) => {
    const lowered = addresses.map(address => address.toLowerCase())

    return this.knex('platform_addresses')
      .select('id', 'address', 'bech32m_address')
      .whereRaw('address = ANY(?)', [addresses])
      .orWhereRaw('bech32m_address = ANY(?)', [lowered])
      .limit(addresses.length)
  }

  getPlatformAddressesRows = async (addresses) => {
    const addressSubquery = this.addressSubquery(addresses)

    const unionTransitions = this.knex
      .with('address_subquery', addressSubquery)
      .unionAll([
        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.sender_id', 'address_subquery.id')
          .select(
            'address_subquery.id as address_id',
            'state_transition_id',
            this.knex.raw('0 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('address_subquery.id', 'state_transition_id'),

        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.recipient_id', 'address_subquery.id')
          .select(
            'address_subquery.id as address_id',
            'state_transition_id',
            this.knex.raw('1 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('address_subquery.id', 'state_transition_id')
      ])

    return this.knex('address_subquery')
      .with('address_subquery', addressSubquery)
      .with('unique_transitions', unionTransitions)
      .select('address as base58_address', 'bech32m_address')
      .select('txs_count.total_txs as total_txs', 'txs_count.incoming_txs as incoming_txs', 'txs_count.outgoing_txs as outgoing_txs',
        'txs_count.total_incoming_amount as total_incoming_amount', 'txs_count.total_outgoing_amount as total_outgoing_amount')
      .leftJoin(
        this.knex('unique_transitions')
          .select(
            'address_id',
            this.knex.raw('count(*) as total_txs'),
            this.knex.raw('count(*) FILTER (WHERE incoming = 1) as incoming_txs'),
            this.knex.raw('count(*) FILTER (WHERE incoming = 0) as outgoing_txs'),
            this.knex.raw('SUM(amount) FILTER (WHERE incoming = 1) as total_incoming_amount'),
            this.knex.raw('SUM(amount) FILTER (WHERE incoming = 0) as total_outgoing_amount')
          )
          .groupBy('address_id')
          .as('txs_count'),
        'txs_count.address_id', 'address_subquery.id'
      )
      .orderBy('address_subquery.id', 'asc')
  }

  getPlatformAddressInfo = async (address) => {
    const [row] = await this.getPlatformAddressesRows([address])

    if (!row) {
      return null
    }

    const platformAddressInfo = PlatformAddress.fromRow(row)

    const platformAddressInfoWithBalance = await this.sdk.platformAddresses.getAddressInfo(platformAddressInfo.bech32mAddress)

    return PlatformAddress.fromObject({
      ...platformAddressInfo,
      nonce: platformAddressInfoWithBalance.nonce,
      balance: platformAddressInfoWithBalance.balance.toString()
    })
  }

  // batch counterpart of getPlatformAddressInfo, so a wallet can cover a whole DIP-17 window
  // in one request. Addresses the indexer has never seen have no row and are left out
  getPlatformAddressesInfo = async (addresses) => {
    const rows = await this.getPlatformAddressesRows(addresses)

    const platformAddresses = rows.map(PlatformAddress.fromRow)
    const bech32mAddresses = platformAddresses.map(address => address.bech32mAddress)

    if (bech32mAddresses.length === 0) {
      return []
    }

    const addressesInfo = await this.sdk.platformAddresses.getAddressesInfos(bech32mAddresses)
    const addressesInfoJSON = Object.fromEntries(
      addressesInfo.map(info => (
        [info.address.toBech32m(NETWORK), {
          nonce: info.nonce,
          balance: info.balance.toString()
        }]))
    )

    return platformAddresses.map(address => {
      const addressInfo = addressesInfoJSON[address.bech32mAddress]

      return PlatformAddress.fromObject({
        ...address,
        balance: addressInfo?.balance ?? undefined,
        nonce: addressInfo?.nonce ?? undefined
      })
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
          balance: info.balance.toString()
        }]))
    )

    const resultSet = platformAddresses.map(addr => {
      const addressInfo = addressesInfoJSON[addr.bech32mAddress]

      return PlatformAddress.fromObject({
        ...addr,
        balance: addressInfo?.balance ?? undefined,
        nonce: addressInfo?.nonce ?? undefined
      })
    })

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count))
  }

  getPlatformAddressTransitions = async (addresses, page, limit, order) => {
    const fromRank = (page - 1) * limit

    const addressSubquery = this.addressSubquery(addresses)

    const unionTransitions = this.knex
      .unionAll([
        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.sender_id', 'address_subquery.id')
          .select(
            'address_subquery.id as address_id',
            'state_transition_id',
            this.knex.raw('0 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('address_subquery.id', 'state_transition_id'),

        this.knex('platform_address_transitions')
          .join('address_subquery', 'platform_address_transitions.recipient_id', 'address_subquery.id')
          .select(
            'address_subquery.id as address_id',
            'state_transition_id',
            this.knex.raw('1 as incoming'),
            this.knex.raw('SUM(amount) as amount')
          )
          .groupBy('address_subquery.id', 'state_transition_id')
      ])

    // the indexer writes one row per input and one per output, so an address that is both an
    // input and the change output of the same transition owns two rows in it. Fold everything
    // the requested set owns in a transition into a single row holding the net amount, and
    // read the direction off its sign. Across a set the fold is what merges the addresses
    const transitionsSubquery = this.knex('unique_transitions')
      .select('state_transition_id')
      .select(this.knex.raw('COALESCE(SUM(amount) FILTER (WHERE incoming = 1), 0) - COALESCE(SUM(amount) FILTER (WHERE incoming = 0), 0) as amount'))
      .select(this.knex.raw('MIN(address_id) as address_id'))
      .select(this.knex.raw('COUNT(DISTINCT address_id) as addresses_count'))
      .groupBy('state_transition_id')

    const countSubquery = this.knex
      .select(
        this.knex('transitions_subquery')
          .count('*')
          .as('total_count')
      )

    // state_transition_id is insertion order, which is not a usable merge key across a set of
    // addresses, so page on the chain order instead
    const transitionsSubqueryWithTotalCount = this.knex('transitions_subquery')
      .with('address_subquery', addressSubquery)
      .with('unique_transitions', unionTransitions)
      .with('transitions_subquery', transitionsSubquery)
      .leftJoin('address_subquery', 'address_subquery.id', 'transitions_subquery.address_id')
      .leftJoin('state_transitions', 'state_transitions.id', 'transitions_subquery.state_transition_id')
      .select('transitions_subquery.state_transition_id as state_transition_id', 'amount')
      .select('state_transitions.hash as tx_hash', 'state_transitions.index as index',
        'state_transitions.block_hash as block_hash', 'state_transitions.type as type',
        'state_transitions.gas_used as gas_used', 'state_transitions.status as status',
        'state_transitions.error as error', 'state_transitions.owner as owner',
        'state_transitions.data as data', 'state_transitions.block_height as block_height')
      .select(this.knex.raw('amount >= 0 as incoming'))
      // a transition can touch more than one address of the requested set, and then no single
      // one of them describes the row
      .select(this.knex.raw('CASE WHEN addresses_count = 1 THEN address_subquery.address END as address'))
      .select(this.knex.raw('CASE WHEN addresses_count = 1 THEN address_subquery.bech32m_address END as bech32m_address'))
      .select(countSubquery.as('total_count'))
      .orderBy([
        { column: 'state_transitions.block_height', order },
        { column: 'state_transitions.index', order }
      ])
      .offset(fromRank)
      .limit(limit)
      .as('transitions_with_total_count_subquery')

    const rows = await this.knex(transitionsSubqueryWithTotalCount)
      .select('tx_hash', 'index', 'block_hash', 'type',
        'gas_used', 'status', 'error', 'owner', 'data', 'incoming', 'amount', 'total_count',
        'blocks.timestamp as timestamp', 'block_height',
        'address as base58_address', 'bech32m_address', 'state_transition_id')
      .leftJoin('blocks', 'transitions_with_total_count_subquery.block_height', 'blocks.height')

    const identifiers = rows.filter(row => row.owner != null).map(row => row.owner?.trim())

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
        aliases,
        type: StateTransitionEnum[row.type]
      })
    })

    const [row] = rows

    return new PaginatedResultSet(resultSet, page, limit, Number(row?.total_count ?? 0))
  }
}
