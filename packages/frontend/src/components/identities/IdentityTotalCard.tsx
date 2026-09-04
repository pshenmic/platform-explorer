'use client'

import type { ComponentType, ReactNode } from 'react'
import type { Identity, Rate } from '../../types'
import type { LoadableState } from '../../types/common'
import {
  Alias as AliasJs,
  AliasesList as AliasesListJs,
  CreditsBlock as CreditsBlockJs,
  DateBlock as DateBlockJs,
  Identifier as IdentifierJs,
  InfoLine as InfoLineJs
} from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'
import { SmoothSize, ValueContainer } from '../ui/containers'
import { ChevronIcon } from '../ui/icons'
import { IdentityDigestCard } from './index'
import { PublicKeysList } from '../publicKeys'
import { findActiveAlias } from '../../util'
import { useState } from 'react'
import { ValueCard } from '../cards'
import './IdentityTotalCard.css'

// Untyped JS modules — cast until migrated
const Alias = AliasJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatarSource?: string | null
  alias?: string
  ellipsis?: boolean
}>
const AliasesList = AliasesListJs as ComponentType<{ aliases?: unknown[]; className?: string }>
const CreditsBlock = CreditsBlockJs as ComponentType<{
  credits?: number | string | null
  rate?: Rate | null
}>
const DateBlock = DateBlockJs as ComponentType<{
  timestamp?: string | number | null
  format?: string
  showTime?: boolean
  showRelativeTooltip?: boolean
}>
const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  className?: string
  avatar?: boolean
  ellipsis?: boolean
  middleEllipsis?: boolean
  copyButton?: boolean
  styles?: string[]
  clickable?: boolean
  alias?: string
}>
const InfoLine = InfoLineJs as ComponentType<{
  className?: string
  title?: ReactNode
  value?: ReactNode
  loading?: boolean
  error?: boolean
}>

interface PublicKeysProps {
  className?: string
  show?: boolean
  publicKeys?: any[]
}

const PublicKeys = ({ className, show, publicKeys = [] }: PublicKeysProps) => (
  <SmoothSize className={className || ''}>
    {publicKeys.length > 0 && (
      <PublicKeysList
        className={`IdentityTotalCard__PublicKeysList ${show ? 'IdentityTotalCard__PublicKeysList--Show' : ''}`}
        publicKeys={publicKeys as any}
      />
    )}
  </SmoothSize>
)

interface IdentityTotalCardProps {
  identity: LoadableState<Identity>
  rate?: Rate | null
}

function IdentityTotalCard({ identity, rate }: IdentityTotalCardProps) {
  const activeAlias = findActiveAlias(identity.data?.aliases)
  const [showPublicKeys, setShowPublicKeys] = useState(false)

  return (
    <div
      className={`InfoBlock InfoBlock--Gradient IdentityPage__CommonInfo IdentityTotalCard ${identity.loading ? 'IdentityTotalCard--Loading' : ''} `}
    >
      {activeAlias && (
        <div className={'IdentityTotalCard__Title'}>
          <Alias ellipsis={false}>{activeAlias.alias}</Alias>
        </div>
      )}

      <div className={'IdentityTotalCard__ContentContainer'}>
        <div className={'IdentityTotalCard__Column'}>
          <div className={'IdentityTotalCard__Header'}>
            <div className={'IdentityTotalCard__HeaderLines'}>
              <InfoLine
                className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Identifier'}
                title={'Identifier'}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.identifier)}
                value={
                  <Identifier copyButton={true} styles={['highlight-both']} ellipsis={false}>
                    {identity.data?.identifier}
                  </Identifier>
                }
              />
              <InfoLine
                className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Balance'}
                title={'Balance'}
                value={<CreditsBlock credits={identity.data?.balance} rate={rate} />}
                loading={identity.loading}
                error={identity.error}
              />
            </div>
            <div className={'IdentityTotalCard__Avatar'}>
              {!identity.error ? (
                <ImageGenerator
                  username={identity.data?.identifier}
                  lightness={50}
                  saturation={50}
                  width={88}
                  height={88}
                />
              ) : (
                'n/a'
              )}
            </div>
          </div>

          <HorisontalSeparator className={'IdentityTotalCard__Separator'} />

          <div className={'IdentityTotalCard__CommonLines'}>
            <InfoLine
              className={'IdentityTotalCard__InfoLine'}
              title={'Revision'}
              value={identity.data?.revision}
              loading={identity.loading}
              error={identity.error || (!identity.loading && identity.data?.revision === undefined)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine'}
              title={'Nonce'}
              value={identity.data?.nonce}
              loading={identity.loading}
              error={identity.error || (!identity.loading && identity.data?.nonce === undefined)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine'}
              title={'Creation date'}
              value={
                identity?.data?.txHash ? (
                  <ValueCard link={`/transaction/${identity.data.txHash}`}>
                    <DateBlock timestamp={identity.data?.timestamp} />
                  </ValueCard>
                ) : (
                  <DateBlock timestamp={identity.data?.timestamp} />
                )
              }
              loading={identity.loading}
              error={identity.error || (!identity.loading && !identity.data?.timestamp)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Names'}
              title={'Identities names'}
              value={
                identity.data?.aliases?.length ? (
                  <AliasesList aliases={identity.data?.aliases} />
                ) : (
                  <ValueContainer className={'IdentityTotalCard__ZeroListBadge'}>
                    none
                  </ValueContainer>
                )
              }
              loading={identity.loading}
              error={identity.error || (!identity.loading && identity.data?.aliases === undefined)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--PublicKeys'}
              title={'Public Keys'}
              value={
                identity.data?.publicKeys?.length ? (
                  <button
                    type={'button'}
                    className={`IdentityTotalCard__PublicKeysShowButton IdentityTotalCard__ToggleButton IdentityTotalCard__ToggleButton--${
                      showPublicKeys && identity.data?.publicKeys?.length > 0 ? 'Gray' : 'Blue'
                    }`}
                    onClick={() => setShowPublicKeys(prev => !prev)}
                  >
                    {identity.data?.publicKeys?.length} public keys
                    <ChevronIcon
                      style={{
                        marginLeft: '4px',
                        height: '10px',
                        width: '10px',
                        transform: `rotate(${showPublicKeys ? '-90deg' : '90deg'})`
                      }}
                    />
                  </button>
                ) : (
                  <ValueContainer className={'IdentityTotalCard__ZeroListBadge'}>
                    none
                  </ValueContainer>
                )
              }
              loading={identity.loading}
              error={
                identity.error || (!identity.loading && identity.data?.publicKeys === undefined)
              }
            />
            <PublicKeys
              publicKeys={identity.data?.publicKeys}
              show={showPublicKeys}
              className={`IdentityTotalCard__PublicKeysListContainer IdentityTotalCard__PublicKeysListContainer--Mobile ${
                showPublicKeys
                  ? ' IdentityTotalCard__PublicKeysListContainer--Opened'
                  : ' IdentityTotalCard__PublicKeysListContainer--Hidden'
              }`}
            />
          </div>
        </div>

        <div className={'IdentityTotalCard__Column'}>
          <IdentityDigestCard
            className={'IdentityTotalCard__Digest'}
            identity={identity}
            rate={rate}
          />
        </div>
      </div>
      <PublicKeys
        publicKeys={identity.data?.publicKeys}
        show={showPublicKeys}
        className={`IdentityTotalCard__PublicKeysListContainer IdentityTotalCard__PublicKeysListContainer--Desktop ${
          showPublicKeys
            ? ' IdentityTotalCard__PublicKeysListContainer--Opened'
            : ' IdentityTotalCard__PublicKeysListContainer--Hidden'
        }`}
      />
    </div>
  )
}

export default IdentityTotalCard
