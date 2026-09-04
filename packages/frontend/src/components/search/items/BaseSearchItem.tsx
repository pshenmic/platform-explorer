import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../../types/common'
import { ChevronIcon } from '../../ui/icons'
import Link from 'next/link'

interface BaseSearchItemProps extends WithChildren, WithClassName {
  href?: string
  gridClassModifier?: string
  onClick?: (data: unknown) => void
  data?: unknown
}

export function BaseSearchItem({
  href,
  children,
  className,
  gridClassModifier,
  onClick,
  data
}: BaseSearchItemProps) {
  const Container = ({
    children: content,
    href: linkHref,
    className: containerClassName
  }: {
    children?: ReactNode
    href?: string
    className?: string
  }) =>
    typeof onClick === 'function' ? (
      <div onClick={() => onClick(data)} className={containerClassName}>
        {content}
      </div>
    ) : (
      <Link href={linkHref ?? '#'} className={containerClassName}>
        {content}
      </Link>
    )

  return (
    <Container href={href} className={`SearchResultsListItem ${className || ''}`}>
      <div
        className={`SearchResultsListItem__Content ${gridClassModifier ? `SearchResultsListItem__Content--${gridClassModifier}` : ''}`}
      >
        {children}
        <div className={'SearchResultsListItem__ArrowButtonContainer'}>
          <span className={'SearchResultsListItem__ArrowButton'}>
            <ChevronIcon />
          </span>
        </div>
      </div>
    </Container>
  )
}

interface BaseSearchItemContentProps {
  mainContent?: ReactNode
  additionalContent?: ReactNode
  timestamp?: ReactNode
}

export function BaseSearchItemContent({
  mainContent,
  additionalContent,
  timestamp
}: BaseSearchItemContentProps) {
  return (
    <>
      <div className={'SearchResultsListItem__Column'}>{mainContent}</div>
      <div className={'SearchResultsListItem__Column SearchResultsListItem__Column--Additional'}>
        {additionalContent}
      </div>
      <div className={'SearchResultsListItem__Column SearchResultsListItem__Column--Timestamp'}>
        {timestamp}
      </div>
    </>
  )
}
