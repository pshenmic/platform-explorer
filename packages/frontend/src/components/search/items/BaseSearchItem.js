import { Button, Grid, GridItem } from '@chakra-ui/react'
import { ChevronIcon } from '../../ui/icons'
import Link from 'next/link'

export function BaseSearchItem ({ href, children, className }) {
  return (
    <Link href={href} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        {children}
        <GridItem className='SearchResultsListItem__ArrowButtonContainer'>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

export function BaseSearchItemContent ({ mainContent, additionalContent, timestamp }) {
  return (
    <>
      <GridItem>{mainContent}</GridItem>
      <GridItem>{additionalContent}</GridItem>
      <GridItem>{timestamp}</GridItem>
    </>
  )
}
