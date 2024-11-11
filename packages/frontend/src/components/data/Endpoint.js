import { CircleIcon, ArrowCornerIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import './Endpoint.scss'

function Endpoint ({ value, status, message, link }) {
  const iconColors = {
    OK: 'green.label',
    UNKNOWN: 'yellow.default',
    ERROR: 'red.default',
    ERR_CONNECTION_REFUSED: 'red.default'
  }

  const Wrapper = ({ children, ...props }) => {
    if (link) return <a href={link} target={'_blank'} rel={'noopener noreferrer'} {...props}>{children}</a>
    return <div {...props}>{children}</div>
  }

  const StatusWrapper = ({ children, ...props }) => {
    if (status !== 'OK' && status !== 'UNKNOWN') {
      return (
        <Tooltip
          title={status}
          content={message || ''}
          placement={'top'}
        >
          <span>{children}</span>
        </Tooltip>
      )
    }

    return children
  }

  return (
    <Wrapper className={'Endpoint'}>
      {link && <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>}
      <div className={'Endpoint__Value'}>{value}</div>
      {status !== undefined &&
        <StatusWrapper>
          <CircleIcon className={'Endpoint__Status'} w={'8px'} h={'8px'} color={iconColors[status] || iconColors.ERROR}/>
        </StatusWrapper>
      }
    </Wrapper>
  )
}

export default Endpoint
