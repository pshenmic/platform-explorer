'use client'

import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { SmoothSize, ValueContainer } from '../ui/containers'
import { Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import { findActiveAlias, getTokenName } from '../../util'
import TokenDigestCard from './TokenDigestCard'
import { ValueCard } from '../cards'
import { LocalisationList } from './localisation'
import { useState } from 'react'
import ImageGenerator from '../imageGenerator'
import './TokenTotalCard.scss'

const LocalisationTranslations = ({ className, show, localisations = {} }) => (
  <SmoothSize className={className || ''}>
    {Object.keys(localisations).length > 0 &&
      <LocalisationList
        className={`TokenTotalCard__LocalisationList ${show ? 'TokenTotalCard__LocalisationList--Show' : ''}`}
        localisations={localisations}
      />
    }
  </SmoothSize>
)

function TokenTotalCard ({ token, rate, loading }) {
  const activeAlias = findActiveAlias(token.data?.aliases)
  const [showLocalisations, setShowLocalisations] = useState(false)
  const {
    identifier,
    position,
    timestamp,
    description,
    localizations,
    dataContractIdentifier,
    mainGroup,
    decimals
  } = token?.data || {}
  const localizationsCount = Object.keys(localizations || {}).length

  return (
    <div className={`InfoBlock InfoBlock--Gradient tokenPage__CommonInfo TokenTotalCard ${loading ? 'TokenTotalCard--Loading' : ''} `}>
      {activeAlias &&
        <div className={'TokenTotalCard__Title'}>
          <Alias ellipsis={false}>{activeAlias.alias}</Alias>
        </div>
      }

      <div className={'TokenTotalCard__ContentContainer'}>
        <div className={'TokenTotalCard__Column'}>
          <div className={'TokenTotalCard__Header'}>
            <div className={'TokenTotalCard__HeaderLines'}>
              <InfoLine
                className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--Identifier'}
                title={'Identifier'}
                loading={loading}
                error={token.error || (!loading && !token.data?.identifier)}
                value={(
                  <Identifier
                    copyButton={true}
                    styles={['highlight-both']}
                    ellipsis={false}
                  >
                    {identifier}
                  </Identifier>
                )}
              />
              <InfoLine
                className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--Balance'}
                title={'Name'}
                value={getTokenName(localizations)}
                loading={loading}
                error={token.error}
              />
            </div>
            <div className={'TokenTotalCard__Avatar'}>
              <ImageGenerator
                username={identifier}
                lightness={50}
                saturation={50}
                width={88}
                height={88}
              />
            </div>
          </div>

          <HorisontalSeparator className={'TokenTotalCard__Separator'}/>

          <div className={'TokenTotalCard__CommonLines'}>
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Description'}
              value={description}
              loading={loading}
              error={token.error || (!loading && !description)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Decimals'}
              value={decimals}
              loading={loading}
              error={token.error || (!loading && decimals == null)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Token Contract Position'}
              value={position}
              loading={loading}
              error={token.error || (!loading && position == null)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Main Group'}
              value={dataContractIdentifier
                ? <ValueCard link={`/dataContract/${dataContractIdentifier}?tab=groups&group=${mainGroup}#tabs`}>{mainGroup}</ValueCard>
                : mainGroup
              }
              loading={loading}
              error={token.error || (!loading && mainGroup == null)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--DataContract'}
              title={'Data Contract'}
              value={
                <ValueCard link={`/dataContract/${dataContractIdentifier}`}>
                  <Identifier avatar={true} copyButton={true} ellipsis={false} styles={['highlight-both']}>
                    {dataContractIdentifier}
                  </Identifier>
                </ValueCard>
              }
              loading={loading}
              error={token.error || (!loading && !dataContractIdentifier)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Creation date'}
              value={<DateBlock timestamp={timestamp || null} showTime={true}/>}
              loading={loading}
              error={token.error || (!loading && !timestamp)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--Localisation'}
              title={'Localisation'}
              value={localizationsCount > 0
                ? <Button
                    className={'TokenTotalCard__LocalisationShowButton'}
                    size={'sm'}
                    variant={showLocalisations && localizationsCount > 0 ? 'gray' : 'blue'}
                    onClick={() => setShowLocalisations(prev => !prev)}
                  >
                    {localizationsCount} translations
                    <ChevronIcon ml={'4px'} h={'10px'} w={'10px'}
                                 transform={`rotate(${showLocalisations ? '-90deg' : '90deg'})`}/>
                  </Button>
                : <ValueContainer className={'TokenTotalCard__ZeroListBadge'}>none</ValueContainer>
              }
              loading={loading}
              error={token.error}
            />
            <LocalisationTranslations
              localisations={localizations}
              show={showLocalisations}
              className={`TokenTotalCard__LocalisationListContainer TokenTotalCard__LocalisationListContainer--Mobile ${showLocalisations
                ? ' TokenTotalCard__LocalisationListContainer--Opened'
                : ' TokenTotalCard__LocalisationListContainer--Hidden'}`}
            />
          </div>
        </div>

        <div className={'TokenTotalCard__Column'}>
          <TokenDigestCard
            token={token}
            rate={rate}
            loading={loading}
          />
        </div>
      </div>
      <LocalisationTranslations
        localisations={localizations}
        show={showLocalisations}
        className={`TokenTotalCard__LocalisationListContainer TokenTotalCard__LocalisationListContainer--Desktop ${showLocalisations
          ? ' TokenTotalCard__LocalisationListContainer--Opened'
          : ' TokenTotalCard__LocalisationListContainer--Hidden'}`}
      />
    </div>
  )
}

export default TokenTotalCard
