import Tooltip from './Tooltip'
import './EpochTooltip.scss'

export default function EpochTooltip ({ epoch, children }) {
  const dateOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }

  return (
    <Tooltip
      label={(
        <div className={'EpochTooltip'}>
          <div className={'EpochTooltip__Line'}>
            <span className={'EpochTooltip__Title'}>From </span>
            <span className={'EpochTooltip__Value'}>{new Date(epoch.startTime).toLocaleString('en-GB', dateOptions)}</span>
          </div>
          <div className={'EpochTooltip__Line'}>
            <span className={'EpochTooltip__Title'}>To </span>
            <span className={'EpochTooltip__Value'}>{new Date(epoch.endTime).toLocaleString('en-GB', dateOptions)}</span>
          </div>
        </div>
      )}
      placement={'top'}
      color={'#fff'}
    >
      {children}
    </Tooltip>
  )
}
