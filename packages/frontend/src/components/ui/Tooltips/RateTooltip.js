import Tooltip from './Tooltip'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../../util'
import './RateTooltip.scss'

export default function RateTooltip ({ credits, dash, usd, rate, children, placement }) {
  if (!dash && typeof credits === 'number') dash = creditsToDash(credits)
  if (!usd && typeof dash === 'number' && rate?.usd) usd = dash * rate?.usd

  const hasContent = typeof dash === 'number' || typeof usd === 'number'
  // Avoid empty tips when nothing to show (and after Tooltip dropped the unused `label` prop)
  if (!hasContent) return children

  return (
    <Tooltip
      content={(
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
