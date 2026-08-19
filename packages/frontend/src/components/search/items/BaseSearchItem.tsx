import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../../types/common'
import { Button, Grid, GridItem } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import Link from 'next/link'

interface BaseSearchItemProps extends WithChildren, WithClassName {
  href?: string
  gridClassModifier?: string
  onClick?: (data: unknown) => void
  data?: unknown
}

export function BaseSearchItem ({
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
  }) => typeof onClick === 'function'
    ? <div onClick={() => onClick(data)} className={containerClassName}>{content}</div>
    : <Link href={linkHref ?? '#'} className={containerClassName}>{content}</Link>

  return (
    <Container href={href} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={`SearchResultsListItem__Content ${gridClassModifier ? `SearchResultsListItem__Content--${gridClassModifier}` : ''}`}>
        {children}
        <GridItem className={'SearchResultsListItem__ArrowButtonContainer'}>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Container>
  )
}

interface BaseSearchItemContentProps {
  mainContent?: ReactNode
  additionalContent?: ReactNode
  timestamp?: ReactNode
}

export function BaseSearchItemContent ({ mainContent, additionalContent, timestamp }: BaseSearchItemContentProps) {
  return (
    <>
      <GridItem className={'SearchResultsListItem__Column'}>{mainContent}</GridItem>
      <GridItem className={'SearchResultsListItem__Column SearchResultsListItem__Column--Additional'}>{additionalContent}</GridItem>
      <GridItem className={'SearchResultsListItem__Column SearchResultsListItem__Column--Timestamp'}>{timestamp}</GridItem>
    </>
  )
}
