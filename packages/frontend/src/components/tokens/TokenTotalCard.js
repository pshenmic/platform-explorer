'use client'

import { Alias, Identifier, InfoLine } from '../data'
import { HorisontalSeparator } from '../ui/separators'
import { findActiveAlias } from '../../util'
// import TokenDigestCard from './TokenDigestCard'
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
          </div>
        </div>

        <div className={'TokenTotalCard__Column'}>
          Token Digest Card will be here
        </div>
      </div>
    </div>
  )
}

export default TokenTotalCard
