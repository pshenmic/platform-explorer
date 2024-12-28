import { Tooltip } from '../ui/Tooltips'
import { ErrorIcon, QueuedIcon } from '../ui/icons'
import './Alias.scss'

export default function Alias ({ alias, status, children, ellipsis = true, className }) {
  alias = alias || children
  if (typeof alias !== 'string') return <></>

  const dashIndex = alias?.lastIndexOf('.dash')

  const statusClasses = {
    locked: 'Alias--Locked',
    pending: 'Alias--Pending'
  }

  const StatusIcon = (props) => {
    if (status === 'pending') return <QueuedIcon {...props}/>
    if (status === 'locked') return <ErrorIcon {...props}/>
    return null
  }

  const titles = {
    ok: 'Alias is owned',
    locked: 'Alias is locked',
    pending: 'Alias is pending'
  }

  const Container = ({ children }) => (
    titles?.[status]
      ? <Tooltip content={titles?.[status]} placement={'top'}>{children}</Tooltip>
      : children
  )

  return (
    <Container>
      <div className={`Alias ${statusClasses?.[status] || ''} ${ellipsis ? 'Alias--Ellipsis' : ''}  ${className || ''}`}>
        <span className={'Alias__Name'}>
          {dashIndex !== -1
            ? alias?.slice(0, dashIndex)
            : alias
          }
        </span>

        {dashIndex !== -1 &&
          <span className={'Alias__Domain'}>
            {alias?.slice(dashIndex)}
          </span>
        }

        <StatusIcon className={'Alias__LockedIcon'}/>
      </div>
    </Container>
  )
}
