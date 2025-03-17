'use client'

import { Alias, AliasesList, CreditsBlock, DateBlock, Identifier, InfoLine } from '../data'
import ImageGenerator from '../imageGenerator'
import { HorisontalSeparator } from '../ui/separators'
import { SmoothSize, ValueContainer } from '../ui/containers'
import { Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import { IdentityDigestCard } from './index'
import { PublicKeysList } from '../publicKeys'
import { findActiveAlias } from '../../util'
import { useState } from 'react'
import { ValueCard } from '../cards'
import './IdentityTotalCard.scss'

const PublicKeys = ({ className, show, publicKeys = [] }) => (
  <SmoothSize className={className || ''}>
    {publicKeys.length > 0 &&
      <PublicKeysList
        className={`IdentityTotalCard__PublicKeysList ${show ? 'IdentityTotalCard__PublicKeysList--Show' : ''}`}
        publicKeys={publicKeys}
      />
    }
  </SmoothSize>
)

function IdentityTotalCard ({ identity, rate }) {
  const activeAlias = findActiveAlias(identity.data?.aliases)
  const [showPublicKeys, setShowPublicKeys] = useState(false)

  return (
    <div className={`InfoBlock InfoBlock--Gradient IdentityPage__CommonInfo IdentityTotalCard ${identity.loading ? 'IdentityTotalCard--Loading' : ''} `}>
      {activeAlias &&
        <div className={'IdentityTotalCard__Title'}>
          <Alias ellipsis={false}>{activeAlias.alias}</Alias>
        </div>
      }

      <div className={'IdentityTotalCard__ContentContainer'}>
        <div className={'IdentityTotalCard__Column'}>
          <div className={'IdentityTotalCard__Header'}>
            <div className={'IdentityTotalCard__HeaderLines'}>
              <InfoLine
                className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Identifier'}
                title={'Identifier'}
                loading={identity.loading}
                error={identity.error || (!identity.loading && !identity.data?.identifier)}
                value={(
                  <Identifier
                    copyButton={true}
                    styles={['highlight-both']}
                    ellipsis={false}
                  >
                    {identity.data?.identifier}
                  </Identifier>
                )}
              />
              <InfoLine
                className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Balance'}
                title={'Balance'}
                value={<CreditsBlock credits={identity.data?.balance} rate={rate}/>}
                loading={identity.loading}
                error={identity.error}
              />
            </div>
            <div className={'IdentityTotalCard__Avatar'}>
              {!identity.error
                ? <ImageGenerator
                  username={identity.data?.identifier}
                  lightness={50}
                  saturation={50}
                  width={88}
                  height={88}/>
                : 'n/a'
              }
            </div>
          </div>

          <HorisontalSeparator className={'IdentityTotalCard__Separator'}/>

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
              title={'Creation date'}
              value={identity?.data?.txHash
                ? <ValueCard link={`/transaction/${identity.data.txHash}`}>
                    <DateBlock timestamp={identity.data?.timestamp}/>
                  </ValueCard>
                : <DateBlock timestamp={identity.data?.timestamp}/>
              }
              loading={identity.loading}
              error={identity.error || (!identity.loading && !identity.data?.timestamp)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--Names'}
              title={'Identities names'}
              value={identity.data?.aliases?.length
                ? <AliasesList aliases={identity.data?.aliases}/>
                : <ValueContainer className={'IdentityTotalCard__ZeroListBadge'}>none</ValueContainer>
              }
              loading={identity.loading}
              error={identity.error || (!identity.loading && identity.data?.aliases === undefined)}
            />
            <InfoLine
              className={'IdentityTotalCard__InfoLine IdentityTotalCard__InfoLine--PublicKeys'}
              title={'Public Keys'}
              value={identity.data?.publicKeys?.length
                ? <Button
                    className={'IdentityTotalCard__PublicKeysShowButton'}
                    size={'sm'}
                    variant={showPublicKeys && identity.data?.publicKeys?.length > 0 ? 'gray' : 'blue'}
                    onClick={() => setShowPublicKeys(prev => !prev)}
                  >
                    {identity.data?.publicKeys?.length} public keys
                    <ChevronIcon ml={'4px'} h={'10px'} w={'10px'}
                                 transform={`rotate(${showPublicKeys ? '-90deg' : '90deg'})`}/>
                  </Button>
                : <ValueContainer className={'IdentityTotalCard__ZeroListBadge'}>none</ValueContainer>
              }
              loading={identity.loading}
              error={identity.error || (!identity.loading && identity.data?.publicKeys === undefined)}
            />
            <PublicKeys
              publicKeys={identity.data?.publicKeys}
              show={showPublicKeys}
              className={`IdentityTotalCard__PublicKeysListContainer IdentityTotalCard__PublicKeysListContainer--Mobile ${showPublicKeys
                ? ' IdentityTotalCard__PublicKeysListContainer--Opened'
                : ' IdentityTotalCard__PublicKeysListContainer--Hidden'}`}
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
        className={`IdentityTotalCard__PublicKeysListContainer IdentityTotalCard__PublicKeysListContainer--Desktop ${showPublicKeys
          ? ' IdentityTotalCard__PublicKeysListContainer--Opened'
          : ' IdentityTotalCard__PublicKeysListContainer--Hidden'}`}
      />
    </div>
  )
}

export default IdentityTotalCard
