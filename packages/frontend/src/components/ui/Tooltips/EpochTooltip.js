import Tooltip from './Tooltip'
import './EpochTooltip.scss'

function formatDate (timestamp) {
  const date = new Date(timestamp)
  const day = date.getDate()
  const month = date.toLocaleString('en-GB', { month: 'long' })
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')

  return `${day} ${month}, ${hours}:${minutes}`
}

export default function EpochTooltip ({ epoch, children }) {
  return (
    <Tooltip
      label={(
        <div className={'EpochTooltip'}>
          <div className={'EpochTooltip__Line'}>
            {epoch?.number &&
              <div className={'EpochTooltip__Title'}>Epoch #{epoch?.number || ''} started</div>
            }
            {epoch?.startTime &&
              <div className={'EpochTooltip__Value'}>{formatDate(epoch?.startTime)}</div>
            }
          </div>

          {epoch?.endTime &&
            <div className={'EpochTooltip__Line'}>
              <div className={'EpochTooltip__Title'}>Next epoch:</div>
              <div className={'EpochTooltip__Value'}>{formatDate(epoch?.endTime)}</div>
            </div>
          }
        </div>
      )}
      placement={'top'}
      color={'#fff'}
    >
      {children}
    </Tooltip>
  )
}
