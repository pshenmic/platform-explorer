import { Button, Grid, GridItem } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import Link from 'next/link'

export function BaseSearchItem ({
  href,
  children,
  className,
  gridClassModifier,
  onClick,
  data
}) {
  const Container = ({ children, ...props }) => typeof onClick === 'function'
    ? <div onClick={() => onClick(data)} {...props}>{children}</div>
    : <Link href={props?.href} {...props}>{children}</Link>

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

export function BaseSearchItemContent ({ mainContent, additionalContent, timestamp }) {
  return (
    <>
      <GridItem className={'SearchResultsListItem__Column'}>{mainContent}</GridItem>
      <GridItem className={'SearchResultsListItem__Column SearchResultsListItem__Column--Additional'}>{additionalContent}</GridItem>
      <GridItem className={'SearchResultsListItem__Column SearchResultsListItem__Column--Timestamp'}>{timestamp}</GridItem>
    </>
  )
}
