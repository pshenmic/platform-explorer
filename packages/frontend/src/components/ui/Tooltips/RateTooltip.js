import Tooltip from './Tooltip'
import './RateTooltip.scss'

export default function RateTooltip ({ dash, usd, children }) {
  return (
    <Tooltip
      label={(
        <div className={'RateTooltip'}>
          {typeof dash === 'number' && <div className={'RateTooltip__Dash'}>{Number(dash).toFixed(8)} Dash</div>}
          {typeof usd === 'number' && <div className={'RateTooltip__Usd'}>~{Number(usd).toFixed(2)}$</div>}
        </div>
      )}
      placement={'right'}
    >
      {children}
    </Tooltip>
  )
}
