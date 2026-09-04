import type { ComponentType, ReactNode } from 'react'
import type { Localization } from '../../../types'
import IdentifierJs from '../../data/Identifier'
import NotActiveJs from '../../data/NotActive'
import { currencyRound, getTokenName } from '../../../util'
import ImageGenerator from '../../imageGenerator'
import './TokenCardContent.css'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  ellipsis?: boolean
  styles?: string[]
  avatar?: boolean
  copyButton?: boolean
}>

const NotActive = NotActiveJs as ComponentType<{ children?: ReactNode }>

export interface TokenCardToken {
  tokenIdentifier?: string | null
  localizations?: Record<string, Localization> | null
  transitionCount?: number | string | null
}

interface TokenCardContentProps {
  token?: TokenCardToken | null
  nullMessage?: string
}

export function TokenCardContent({ token = {}, nullMessage = 'No data' }: TokenCardContentProps) {
  const { tokenIdentifier, localizations, transitionCount } = token || {}

  if (!token || !tokenIdentifier) {
    return <NotActive>{nullMessage}</NotActive>
  }

  const txsCount = currencyRound(transitionCount as number | string)

  return (
    <div className={'TokenCardContent'}>
      <div className={'TokenCardContent__Row'}>
        <div className={'TokenCardContent__NameContainer'}>
          <ImageGenerator
            className={'TokenCardContent__Avatar'}
            username={tokenIdentifier}
            lightness={50}
            saturation={50}
            width={24}
            height={24}
          />
          <span className={'TokenCardContent__Name'}>{getTokenName(localizations)}</span>
        </div>
        <span className={'TokenCardContent__Count'}>
          <span className={'TokenCardContent__CountValue'}>{txsCount}</span>
          <span>txs</span>
        </span>
      </div>

      <Identifier ellipsis={true} styles={['highlight-both']}>
        {tokenIdentifier}
      </Identifier>
    </div>
  )
}
