'use client'

import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { SmoothSize, ValueContainer } from '../ui/containers'
import { Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import { findActiveAlias } from '../../util'
import TokenDigestCard from './TokenDigestCard'
import { ValueCard } from '../cards'
import { LocalisationList } from './localisation'
import { useState } from 'react'
import './TokenTotalCard.scss'

const LocalisationTranslations = ({ className, show, localisations = [] }) => (
  <SmoothSize className={className || ''}>
    {localisations.length > 0 &&
      <LocalisationList
        className={`TokenTotalCard__LocalisationList ${show ? 'TokenTotalCard__LocalisationList--Show' : ''}`}
        localisations={localisations}
      />
    }
  </SmoothSize>
)

function TokenTotalCard ({ token, loading }) {
  const activeAlias = findActiveAlias(token.data?.aliases)
  const [showLocalisations, setShowLocalisations] = useState(false)

  const mockLocalisations = [
    { language: 'English', singular: 'Tether', plural: 'Tethers', capitalize: true },
    { language: 'Russian', singular: 'Тэзэр', plural: 'Тэзэры', capitalize: true },
    { language: 'Japanese', singular: 'ダッシュ (Tetheruu)', plural: 'ダッシュズ (Tetheeres)', capitalize: true },
    { language: 'Thai', singular: 'แดช (Tethe)', plural: 'แดชหลายตัว (Te le teher)', capitalize: true },
    { language: 'Chinese', singular: '达世币 (Tethrr)', plural: '达世币们 (Telother)', capitalize: true }
  ]

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
                    CoUR4uj27qcnY29ZDLmDj33RhLyMDp9z8spDBjpZ9r3o
                  </Identifier>
                )}
              />
              <InfoLine
                className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--Balance'}
                title={'Name'}
                value={'Tether'}
                loading={loading}
                error={token.error}
              />
            </div>
            <div className={'TokenTotalCard__Avatar'}>
              image
            </div>
          </div>

          <HorisontalSeparator className={'TokenTotalCard__Separator'}/>

          <div className={'TokenTotalCard__CommonLines'}>
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Token Info'}
              value={'The first stablecoin on Dash. Tether is everywhere, even on Platform-explorer thanks to Pshenmic team and DCG'}
              loading={loading}
              error={token.error || (!loading && token.data?.revision === undefined)}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Decimals'}
              value={2}
              loading={loading}
              error={token.error}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Token Contract Position'}
              value={<ValueCard link={'/tokens'}>22</ValueCard>}
              loading={loading}
              error={token.error}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--DataContract'}
              title={'Data Contract'}
              value={
                <ValueCard link={`/dataContract/${'Cgjuqav7uD7FnWNqNyHEWet382Yzx7NYNRUNqfJ3d2je'}`}>
                  <Identifier avatar={true} copyButton={true} ellipsis={false} styles={['highlight-both']}>
                    Cgjuqav7uD7FnWNqNyHEWet382Yzx7NYNRUNqfJ3d2je
                  </Identifier>
                </ValueCard>
              }
              loading={loading}
              error={token.error}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine'}
              title={'Creation date'}
              value={<DateBlock timestamp={new Date().toISOString()} showTime={true}/>}
              loading={loading}
              error={token.error}
            />
            <InfoLine
              className={'TokenTotalCard__InfoLine TokenTotalCard__InfoLine--Localisation'}
              title={'Localisation'}
              value={mockLocalisations?.length
                ? <Button
                    className={'TokenTotalCard__LocalisationShowButton'}
                    size={'sm'}
                    variant={showLocalisations && mockLocalisations?.length > 0 ? 'gray' : 'blue'}
                    onClick={() => setShowLocalisations(prev => !prev)}
                  >
                    {mockLocalisations?.length} translations
                    <ChevronIcon ml={'4px'} h={'10px'} w={'10px'}
                                 transform={`rotate(${showLocalisations ? '-90deg' : '90deg'})`}/>
                  </Button>
                : <ValueContainer className={'TokenTotalCard__ZeroListBadge'}>none</ValueContainer>
              }
              loading={loading}
              error={token.error}
            />
            <LocalisationTranslations
              localisations={mockLocalisations}
              show={showLocalisations}
              className={`TokenTotalCard__LocalisationListContainer TokenTotalCard__LocalisationListContainer--Mobile ${showLocalisations
                ? ' TokenTotalCard__LocalisationListContainer--Opened'
                : ' TokenTotalCard__LocalisationListContainer--Hidden'}`}
            />
          </div>
        </div>

        <div className={'TokenTotalCard__Column'}>
          <TokenDigestCard
            token={{ loading: false, error: null }}
            rate={{ data: { usd: 259.15 } }}
          />
        </div>
      </div>
      <LocalisationTranslations
        localisations={mockLocalisations}
        show={showLocalisations}
        className={`TokenTotalCard__LocalisationListContainer TokenTotalCard__LocalisationListContainer--Desktop ${showLocalisations
          ? ' TokenTotalCard__LocalisationListContainer--Opened'
          : ' TokenTotalCard__LocalisationListContainer--Hidden'}`}
      />
    </div>
  )
}

export default TokenTotalCard
