import Tooltip from './Tooltip'
import { roundUsd } from '../../../util'
import './RateTooltip.scss'

export default function RateTooltip ({ dash, usd, children }) {
  return (
    <Tooltip
      label={(
        <div className={'RateTooltip'}>
          {typeof dash === 'number' && <div className={'RateTooltip__Dash'}>{Number(dash).toFixed(8)} Dash</div>}
          {typeof usd === 'number' && <div className={'RateTooltip__Usd'}>~{roundUsd(Number(usd))}$</div>}
        </div>
      )}
      placement={'right'}
    >
      {children}
    </Tooltip>
  )
}
