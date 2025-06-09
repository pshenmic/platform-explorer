'use client'

import { Alias, DateBlock, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { findActiveAlias } from '../../util'
import TokenDigestCard from './TokenDigestCard'
import { ValueCard } from '../cards'
import './TokenTotalCard.scss'

function TokenTotalCard ({ token, loading }) {
  const activeAlias = findActiveAlias(token.data?.aliases)

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
              className={'TokenTotalCard__InfoLine'}
              title={'Data Contract'}
              value={
                <ValueCard link={`/dataContract/${'Cgjuqav7uD7FnWNqNyHEWet382Yzx7NYNRUNqfJ3d2je'}`}>
                  <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
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
              className={'TokenTotalCard__InfoLine'}
              title={'Localisation'}
              value={<>Localisation button</>}
              loading={loading}
              error={token.error}
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
    </div>
  )
}

export default TokenTotalCard
