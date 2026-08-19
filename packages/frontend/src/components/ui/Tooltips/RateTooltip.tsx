import type { ReactElement } from 'react'
import Tooltip from './Tooltip'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../../util'
import type { Rate } from '../../../types'
import type { PlacementWithLogical } from '@chakra-ui/react'
import './RateTooltip.scss'

interface RateTooltipProps {
  credits?: number
  dash?: number
  usd?: number
  rate?: Pick<Rate, 'usd'> | null
  children: ReactElement
  placement?: PlacementWithLogical
}

export default function RateTooltip ({ credits, dash, usd, rate, children, placement }: RateTooltipProps) {
  let resolvedDash = dash
  let resolvedUsd = usd
  if (resolvedDash == null && typeof credits === 'number') resolvedDash = creditsToDash(credits)
  if (resolvedUsd == null && typeof resolvedDash === 'number' && rate?.usd) resolvedUsd = resolvedDash * rate.usd

  return (
    <Tooltip
      label={(
        <div className={'RateTooltip'}>
          {typeof resolvedDash === 'number' && <div className={'RateTooltip__Dash'}>{removeTrailingZeros(Number(resolvedDash).toFixed(8))} Dash</div>}
          {typeof resolvedUsd === 'number' && <div className={'RateTooltip__Usd'}>~{roundUsd(Number(resolvedUsd))}$</div>}
        </div>
      )}
      placement={placement || 'right'}
    >
      {children}
    </Tooltip>
  )
}
