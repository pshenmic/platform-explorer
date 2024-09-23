import Tooltip from './Tooltip'
import './RateTooltip.scss'

export default function RateTooltip ({ dash, usd, children }) {
  return (
    <Tooltip
      label={(
        <div className={'RateTooltip'}>
          {dash && <div className={'RateTooltip__Dash'}>{dash} Dash</div>}
          {usd && <div className={'RateTooltip__Usd'}>~{usd}$</div>}
        </div>
      )}
      placement={'right'}
    >
      {children}
    </Tooltip>
  )
}
