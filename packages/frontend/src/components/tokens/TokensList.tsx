'use client'

import { useRouter } from 'next/navigation'
import { Flex } from '@chakra-ui/react'
import { Alias, Identifier, NotActive, CreditsBlock } from '../data'
import { Supply } from './index'
import { LinkContainer, ValueContainer } from '../ui/containers'
import { Tooltip } from '../ui/Tooltips'
import { FormattedNumber } from '../ui/FormattedNumber'
import { DataList } from '../ui/lists'
import { ErrorMessageBlock } from '../Errors'
import Pagination from '../pagination'
import { findActiveAlias, getMinTokenPrice } from '../../util'

function tokenName (token: any) {
  return token?.localizations?.en?.singularForm ||
    (Object.values(token?.localizations || {})[0] as any)?.singularForm || ''
}

function TokensList ({
  tokens = [],
  rate,
  headerStyles = 'default',
  variant = 'default',
  pagination,
  loading,
  itemsCount
}: {
  tokens?: any[]
  rate?: any
  headerStyles?: string
  variant?: string
  pagination?: any
  loading?: any
  itemsCount?: number
}) {
  const router = useRouter()

  const columns = [
    {
      key: 'tokenName',
      header: 'Token Name',
      grow: true,
      minWidth: 150,
      cell: (token: any) => {
        const name = tokenName(token)
        return name
          ? <Alias avatarSource={token.identifier}>{name}</Alias>
          : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{token.identifier}</Identifier>
      }
    },
    {
      key: 'supply',
      header: 'Supply',
      minWidth: 120,
      priority: 3,
      cell: (token: any) => (token.maxSupply
        ? <Supply currentSupply={token.totalSupply} maxSupply={token.maxSupply || token.totalSupply} decimals={token.decimals}/>
        : <FormattedNumber decimals={token.decimals}>{token.totalSupply}</FormattedNumber>)
    },
    {
      key: 'price',
      header: 'Price',
      minWidth: 92,
      align: 'right',
      cell: (token: any) => {
        if (token.price != null) {
          return (
            <Tooltip placement={'top'} maxW={'none'} content={<CreditsBlock credits={token.price} rate={rate}/>}>
              <div>
                <ValueContainer colorScheme={'emeralds'} size={'sm'}>
                  <FormattedNumber decimals={token.decimals}>{token.price}</FormattedNumber>
                </ValueContainer>
              </div>
            </Tooltip>
          )
        }
        if (token.prices != null && token.prices.length > 0) {
          return (
            <Tooltip placement={'top'} maxW={'none'} content={<CreditsBlock credits={getMinTokenPrice(token.prices)} rate={rate}/>}>
              <Flex gap={'0.25rem'} fontSize={'0.75rem'} fontWeight={500}>
                From <FormattedNumber decimals={token.decimals}>{getMinTokenPrice(token.prices)}</FormattedNumber>
              </Flex>
            </Tooltip>
          )
        }
        return null
      }
    },
    {
      key: 'contract',
      header: 'Contract',
      grow: true,
      minWidth: 130,
      priority: 1,
      cell: (token: any) => (
        <LinkContainer
          onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/dataContract/${token.dataContractIdentifier}`) }}
        >
          <Identifier ellipsis={true} styles={['highlight-both']} avatar={true}>{token.dataContractIdentifier}</Identifier>
        </LinkContainer>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      grow: true,
      minWidth: 130,
      priority: 2,
      cell: (token: any) => {
        const ownerId = typeof token.owner === 'object' ? token.owner?.identifier : token.owner
        const ownerName = typeof token.owner === 'object' ? findActiveAlias(token.owner?.aliases) : null
        return (
          <LinkContainer
            onClick={e => { e.stopPropagation(); e.preventDefault(); router.push(`/identity/${ownerId}`) }}
          >
            {ownerName
              ? <Alias avatarSource={ownerId} alias={ownerName?.alias}/>
              : <Identifier ellipsis={true} avatar={true} styles={['highlight-both']}>{ownerId}</Identifier>}
          </LinkContainer>
        )
      }
    }
  ]

  if (variant === 'balance') {
    columns.push({
      key: 'balance',
      header: 'Balance',
      minWidth: 100,
      align: 'right',
      cell: (token) => (typeof token.balance === 'number' || typeof token.balance === 'string'
        ? <ValueContainer colorScheme={'emeralds'} size={'sm'}><FormattedNumber decimals={token.decimals} threshold={0}>{token.balance}</FormattedNumber></ValueContainer>
        : <NotActive/>)
    })
  }

  if (tokens === undefined) return <ErrorMessageBlock/>

  return (
    <DataList
      className={'TokensList'}
      items={tokens}
      columns={columns}
      loading={loading}
      rowHref={(token) => `/token/${token.identifier}`}
      rowKey={(token) => token.identifier}
      headerVariant={headerStyles === 'light' ? 'light' : 'default'}
      emptyMessage={'There are no tokens yet.'}
      footer={pagination && (
        <Pagination
          onPageChange={pagination.onPageChange}
          pageCount={pagination.pageCount}
          forcePage={pagination.forcePage}
          justify={true}
        />
      )}
    />
  )
}

export default TokensList
