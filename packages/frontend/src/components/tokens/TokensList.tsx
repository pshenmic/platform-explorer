'use client'

import { useRouter } from 'next/navigation'
import { Alias, Identifier, NotActive, CreditsBlock, BigNumber } from '../data'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { Tooltip } from '../ui/Tooltips'
import { FormattedNumber } from '../ui/FormattedNumber'
import type { ReactNode } from 'react'
import { DataList } from '../ui/lists'
import type { DataListProps } from '../ui/lists/DataList/DataList'
import { ErrorMessageBlock } from '../Errors'
import Pagination from '../pagination'
import { findActiveAlias, getMinTokenPrice } from '../../util'

function tokenName(token: any) {
  return (
    token?.localizations?.en?.singularForm ||
    (Object.values(token?.localizations || {})[0] as any)?.singularForm ||
    ''
  )
}

function TokensList({
  tokens = [],
  rate,
  headerStyles = 'default',
  variant = 'default',
  pagination,
  loading,
  itemsCount,
  filterValues,
  onFilterChange,
  paging,
  title,
  pinFirst = false
}: {
  tokens?: any[]
  rate?: any
  headerStyles?: string
  variant?: string
  pagination?: any
  loading?: any
  itemsCount?: number
  filterValues?: Record<string, unknown>
  onFilterChange?: (key: string, value: unknown) => void
  paging?: DataListProps['paging']
  title?: ReactNode
  pinFirst?: boolean
}) {
  const router = useRouter()
  const canFilter = Boolean(onFilterChange)

  const columns = [
    {
      key: 'tokenName',
      header: 'Token Name',
      filterKey: canFilter ? 'name' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Name or ID',
      grow: true,
      minWidth: 160,
      cell: (token: any) => {
        const name = tokenName(token)
        return (
          <span className={'DataList__Entity'}>
            {name ? (
              <Alias ellipsis={true} avatarSource={token.identifier}>
                {name}
              </Alias>
            ) : (
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {token.identifier}
              </Identifier>
            )}
          </span>
        )
      }
    },
    {
      key: 'position',
      numeric: true,
      header: 'Position',
      minWidth: 88,
      align: 'center',
      cell: (token: any) =>
        token?.position != null ? <BigNumber>{token.position}</BigNumber> : <NotActive />
    },
    {
      key: 'supply',
      numeric: true,
      header: 'Supply',
      minWidth: 108,
      cell: (token: any) => {
        if (token.totalSupply == null) return <NotActive />
        const value = (
          <FormattedNumber decimals={token.decimals}>{token.totalSupply}</FormattedNumber>
        )
        if (token.maxSupply == null) return value
        return (
          <Tooltip
            placement={'top'}
            content={
              <>
                <FormattedNumber decimals={token.decimals}>{token.totalSupply}</FormattedNumber>
                {' / '}
                <FormattedNumber decimals={token.decimals}>{token.maxSupply}</FormattedNumber>
              </>
            }
          >
            <span>{value}</span>
          </Tooltip>
        )
      }
    },
    {
      key: 'price',
      numeric: true,
      header: 'Price',
      minWidth: 96,
      cell: (token: any) => {
        if (token.price != null) {
          return (
            <Tooltip
              placement={'top'}
              maxW={'none'}
              content={<CreditsBlock credits={token.price} rate={rate} />}
            >
              <span>
                <FormattedNumber decimals={token.decimals}>{token.price}</FormattedNumber>
              </span>
            </Tooltip>
          )
        }
        if (token.prices != null && token.prices.length > 0) {
          return (
            <Tooltip
              placement={'top'}
              maxW={'none'}
              content={<CreditsBlock credits={getMinTokenPrice(token.prices)} rate={rate} />}
            >
              <span className={'TokensList__PriceFrom'}>
                From{' '}
                <FormattedNumber decimals={token.decimals}>
                  {getMinTokenPrice(token.prices)}
                </FormattedNumber>
              </span>
            </Tooltip>
          )
        }
        return <NotActive />
      }
    },
    {
      key: 'contract',
      header: 'Contract',
      filterKey: canFilter ? 'contract' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Contract ID',
      grow: true,
      minWidth: 130,
      priority: 1,
      cell: (token: any) => (
        <LinkContainer
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
            router.push(`/dataContract/${token.dataContractIdentifier}`)
          }}
        >
          <Identifier ellipsis={true} styles={['highlight-both']} avatar={true}>
            {token.dataContractIdentifier}
          </Identifier>
        </LinkContainer>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      filterKey: canFilter ? 'owner' : undefined,
      filterType: canFilter ? ('search' as const) : undefined,
      filterPlaceholder: 'Owner ID',
      grow: true,
      minWidth: 130,
      priority: 2,
      cell: (token: any) => {
        const ownerId = typeof token.owner === 'object' ? token.owner?.identifier : token.owner
        const ownerName =
          typeof token.owner === 'object' ? findActiveAlias(token.owner?.aliases) : null
        return (
          <LinkContainer
            onClick={e => {
              e.stopPropagation()
              e.preventDefault()
              router.push(`/identity/${ownerId}`)
            }}
          >
            {ownerName ? (
              <Alias avatarSource={ownerId} alias={ownerName?.alias} />
            ) : (
              <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>
                {ownerId}
              </Identifier>
            )}
          </LinkContainer>
        )
      }
    }
  ]

  if (variant === 'balance') {
    columns.push({
      key: 'balance',
      numeric: true,
      header: 'Balance',
      minWidth: 100,
      align: 'right',
      cell: token =>
        typeof token.balance === 'number' || typeof token.balance === 'string' ? (
          <ValueContainer colorScheme={'emeralds'} size={'sm'}>
            <FormattedNumber decimals={token.decimals} threshold={0}>
              {token.balance}
            </FormattedNumber>
          </ValueContainer>
        ) : (
          <NotActive />
        )
    })
  }

  if (tokens === undefined) return <ErrorMessageBlock />

  return (
    <DataList
      className={'TokensList'}
      items={tokens}
      columns={columns}
      pinFirst={pinFirst}
      loading={loading}
      rowHref={token => `/token/${token.identifier}`}
      rowKey={token => token.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={
        filterValues && Object.keys(filterValues).length
          ? 'No tokens match these filters.'
          : 'There are no tokens yet.'
      }
      filterValues={filterValues}
      onFilterChange={onFilterChange}
      paging={paging}
      title={title}
      footer={
        pagination && (
          <Pagination
            onPageChange={pagination.onPageChange}
            pageCount={pagination.pageCount}
            forcePage={pagination.forcePage}
            justify={true}
          />
        )
      }
    />
  )
}

export default TokensList
