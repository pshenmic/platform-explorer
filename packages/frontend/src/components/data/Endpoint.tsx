import type { ReactNode, ComponentPropsWithoutRef } from 'react'
import { CircleIcon, ArrowCornerIcon } from '../ui/icons'
import { Tooltip } from '../ui/Tooltips'
import './Endpoint.scss'

type EndpointStatus = 'OK' | 'UNKNOWN' | 'ERROR' | 'ERR_CONNECTION_REFUSED' | string

interface EndpointProps {
  value?: ReactNode
  status?: EndpointStatus
  message?: ReactNode
  link?: string
}

function Endpoint ({ value, status, message, link }: EndpointProps) {
  const iconColors: Record<string, string> = {
    OK: 'green.label',
    UNKNOWN: 'yellow.default',
    ERROR: 'red.default',
    ERR_CONNECTION_REFUSED: 'red.default'
  }

  const Wrapper = ({ children, ...props }: ComponentPropsWithoutRef<'a'> & ComponentPropsWithoutRef<'div'> & { children?: ReactNode }) => {
    if (link) return <a href={link} target={'_blank'} rel={'noopener noreferrer'} {...props}>{children}</a>
    return <div {...props}>{children}</div>
  }

  const StatusWrapper = ({ children }: { children: ReactNode }) => {
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

    return <>{children}</>
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
