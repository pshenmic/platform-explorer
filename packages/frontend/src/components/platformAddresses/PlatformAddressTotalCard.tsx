'use client'

import type { ComponentType, ReactNode } from 'react'
import {
  CreditsBlock as CreditsBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs
} from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'
import { PlatformAddressDigestCard } from './index'
import type { PlatformAddressQueryLike } from './PlatformAddressDigestCard'
import type { Rate } from '../../types'
import './PlatformAddressTotalCard.scss'

const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | string | null
  rate?: { data?: Pick<Rate, 'usd'> | null } | null
}>

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  copyButton?: boolean
  styles?: string[]
  ellipsis?: boolean
}>

const InfoLine = InfoLineJs as ComponentType<{
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean
  className?: string
  icon?: ReactNode
}>

interface PlatformAddressTotalCardProps {
  address: PlatformAddressQueryLike
  rate?: { data?: Pick<Rate, 'usd'> | null } | null
}

function PlatformAddressTotalCard ({ address, rate }: PlatformAddressTotalCardProps) {
  return (
    <div className={`InfoBlock InfoBlock--Gradient PlatformAddressTotalCard ${address.isLoading ? 'PlatformAddressTotalCard--Loading' : ''}`}>
      <div className={'PlatformAddressTotalCard__ContentContainer'}>
        <div className={'PlatformAddressTotalCard__Column'}>
          <div className={'PlatformAddressTotalCard__Header'}>
            <div className={'PlatformAddressTotalCard__HeaderLines'}>
              <InfoLine
                className={'PlatformAddressTotalCard__InfoLine PlatformAddressTotalCard__InfoLine--Address'}
                title={'Bech32m Address'}
                loading={address.isLoading}
                error={address.isError || (!address.isLoading && !address.data?.bech32mAddress)}
                value={(
                  <Identifier
                    copyButton={true}
                    styles={['highlight-both']}
                    ellipsis={false}
                  >
                    {address.data?.bech32mAddress}
                  </Identifier>
                )}
              />
              <InfoLine
                className={'PlatformAddressTotalCard__InfoLine PlatformAddressTotalCard__InfoLine--Balance'}
                title={'Balance'}
                value={<CreditsBlock credits={address.data?.balance} rate={rate} />}
                loading={address.isLoading}
                error={address.isError}
              />
            </div>
            <div className={'PlatformAddressTotalCard__Avatar'}>
              {!address.isError
                ? <ImageGenerator
                    username={address.data?.bech32mAddress}
                    lightness={50}
                    saturation={50}
                    width={88}
                    height={88}
                  />
                : 'n/a'
              }
            </div>
          </div>

          <HorisontalSeparator className={'PlatformAddressTotalCard__Separator'} />

          <div className={'PlatformAddressTotalCard__CommonLines'}>
            <InfoLine
              className={'PlatformAddressTotalCard__InfoLine'}
              title={'Nonce'}
              value={address.data?.nonce}
              loading={address.isLoading}
              error={address.isError || (!address.isLoading && address.data?.nonce === undefined)}
            />
            <InfoLine
              className={'PlatformAddressTotalCard__InfoLine'}
              title={'Total Transactions'}
              value={address.data?.totalTxs}
              loading={address.isLoading}
              error={address.isError || (!address.isLoading && address.data?.totalTxs === undefined)}
            />
            <InfoLine
              className={'PlatformAddressTotalCard__InfoLine'}
              title={'Incoming Transactions'}
              value={address.data?.incomingTxs}
              loading={address.isLoading}
              error={address.isError || (!address.isLoading && address.data?.incomingTxs === undefined)}
            />
            <InfoLine
              className={'PlatformAddressTotalCard__InfoLine'}
              title={'Outgoing Transactions'}
              value={address.data?.outgoingTxs}
              loading={address.isLoading}
              error={address.isError || (!address.isLoading && address.data?.outgoingTxs === undefined)}
            />
          </div>
        </div>

        <div className={'PlatformAddressTotalCard__Column'}>
          <PlatformAddressDigestCard
            className={'PlatformAddressTotalCard__Digest'}
            address={address}
            rate={rate}
          />
        </div>
      </div>
    </div>
  )
}

export default PlatformAddressTotalCard
