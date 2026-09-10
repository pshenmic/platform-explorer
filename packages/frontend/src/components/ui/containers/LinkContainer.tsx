import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import Link from 'next/link'
import type { WithChildren, WithClassName } from '../../../types/common'
import './LinkContainer.css'

interface LinkContainerProps
  extends WithChildren,
    WithClassName,
    Omit<ComponentPropsWithoutRef<'div'>, 'className' | 'children'> {
  href?: string
}

function LinkContainer({ children, className, href, ...props }: LinkContainerProps) {
  const Wrapper = ({
    children: wrapperChildren,
    ...wrapperProps
  }: { children?: ReactNode } & Record<string, unknown>) =>
    href ? (
      <Link href={href} {...wrapperProps}>
        {wrapperChildren}
      </Link>
    ) : (
      <div {...wrapperProps}>{wrapperChildren}</div>
    )

  return (
    <Wrapper className={`LinkContainer ${className || ''}`} {...props}>
      {children}
    </Wrapper>
  )
}

export default LinkContainer
