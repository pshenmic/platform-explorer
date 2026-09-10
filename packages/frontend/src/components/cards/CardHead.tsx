import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'

interface CardHeadProps extends WithChildren, WithClassName {
  title?: ReactNode
  extra?: ReactNode
}

export default function CardHead({ title, extra, children, className = '' }: CardHeadProps) {
  const heading = title ? <h2 className={'InfoBlock__Title'}>{title}</h2> : null

  return (
    <div className={`InfoBlock__Head ${className}`.trim()}>
      {extra ? (
        <div className={'InfoBlock__HeadLeft'}>
          {heading}
          {extra}
        </div>
      ) : (
        heading
      )}
      {children && <div className={'InfoBlock__HeadSlot'}>{children}</div>}
    </div>
  )
}
