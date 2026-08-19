import type { ReactNode } from 'react'
import { Heading } from '@chakra-ui/react'
import type { WithChildren, WithClassName } from '../../types/common'

interface CardHeadProps extends WithChildren, WithClassName {
  title?: ReactNode
  extra?: ReactNode
}

export default function CardHead({ title, extra, children, className = '' }: CardHeadProps) {
  const heading = title ? (
    <Heading className={'InfoBlock__Title'} as={'h2'}>
      {title}
    </Heading>
  ) : null

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
