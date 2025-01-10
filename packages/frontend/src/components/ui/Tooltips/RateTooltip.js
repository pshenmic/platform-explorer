import Tooltip from './Tooltip'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../../util'
import './RateTooltip.scss'

export default function RateTooltip ({ credits, dash, usd, rate, children, placement }) {
  if (!dash && typeof credits === 'number') dash = creditsToDash(credits)
  if (!usd && typeof dash === 'number' && rate?.usd) usd = dash * rate?.usd

  return (
    <Tooltip
      label={(
        <div className={'RateTooltip'}>
          {typeof dash === 'number' && <div className={'RateTooltip__Dash'}>{removeTrailingZeros(Number(dash).toFixed(8))} Dash</div>}
          {typeof usd === 'number' && <div className={'RateTooltip__Usd'}>~{roundUsd(Number(usd))}$</div>}
        </div>
      )}
      placement={placement || 'right'}
    >
      {children}
    </Tooltip>
  )
}
