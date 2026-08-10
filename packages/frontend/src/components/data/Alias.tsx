import type { ReactElement, ReactNode } from 'react'
import type { IconProps } from '@chakra-ui/react'
import type { WithChildren, WithClassName } from '../../types/common'
import { Tooltip } from '../ui/Tooltips'
import { ErrorIcon, QueuedIcon } from '../ui/icons'
import ImageGenerator from '../imageGenerator'
import './Alias.scss'

interface AliasProps extends WithChildren, WithClassName {
  alias?: string | null
  status?: string | null
  ellipsis?: boolean
  avatarSource?: string | null
}

export default function Alias ({ alias, status, children, ellipsis = true, avatarSource, className }: AliasProps) {
  const resolvedAlias = alias || children
  if (typeof resolvedAlias !== 'string') return <></>

  const dashIndex = resolvedAlias.lastIndexOf('.dash')

  const statusClasses: Record<string, string> = {
    locked: 'Alias--Locked',
    pending: 'Alias--Pending'
  }

  const StatusIcon = (props: IconProps) => {
    if (status === 'pending') return <QueuedIcon {...props}/>
    if (status === 'locked') return <ErrorIcon {...props}/>
    return null
  }

  const titles: Record<string, string> = {
    ok: 'Alias is owned',
    locked: 'Alias is locked',
    pending: 'Alias is pending'
  }

  const Container = ({ children: containerChildren }: { children: ReactElement }) => (
    status && titles[status]
      ? <Tooltip content={titles[status]} placement={'top'}>{containerChildren}</Tooltip>
      : containerChildren
  )

  return (
    <Container>
      <div className={`Alias ${status ? (statusClasses[status] || '') : ''} ${ellipsis ? 'Alias--Ellipsis' : ''}  ${className || ''}`}>
        {avatarSource && (
          <ImageGenerator className={'Alias__Avatar'} username={avatarSource} lightness={50} saturation={50} width={24} height={24} />
        )}
        <span className={'Alias__SymbolsContainer'}>
          <span className={'Alias__Name'}>
            {dashIndex !== -1
              ? resolvedAlias.slice(0, dashIndex)
              : resolvedAlias
            }
          </span>
          {dashIndex !== -1 &&
            <span className={'Alias__Domain'}>
              {resolvedAlias.slice(dashIndex)}
            </span>
          }
        </span>

        <StatusIcon className={'Alias__LockedIcon'}/>
      </div>
    </Container>
  )
}
