import type { ReactNode } from 'react'
import { Heading } from '@chakra-ui/react'
import type { WithChildren, WithClassName } from '../../types/common'

interface CardHeadProps extends WithChildren, WithClassName {
  title?: ReactNode
  extra?: ReactNode
}

// title flag docked to the corner, `extra` beside it, `children` in the right slot (.InfoBlock__Head)
export default function CardHead ({ title, extra, children, className = '' }: CardHeadProps) {
  const heading = <Heading className={'InfoBlock__Title'} as={'h2'}>{title}</Heading>

  return (
    <div className={`InfoBlock__Head ${className}`.trim()}>
      {extra
        ? <div className={'InfoBlock__HeadLeft'}>{heading}{extra}</div>
        : heading}
      {/* right-side slot: positioning lives here (see .InfoBlock__HeadSlot), not on the child */}
      {children && <div className={'InfoBlock__HeadSlot'}>{children}</div>}
    </div>
  )
}
