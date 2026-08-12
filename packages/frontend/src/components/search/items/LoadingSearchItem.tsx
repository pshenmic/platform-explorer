import type { WithClassName } from '../../../types/common'
import { Button, Grid, GridItem } from '@chakra-ui/react'
import type { ComponentType } from 'react'
// Untyped JS component — loose wrapper until loading/* is migrated
import { LoadingLine as LoadingLineJs } from '../../loading'

const LoadingLine = LoadingLineJs as ComponentType<{ colorScheme?: string }>

export function LoadingSearchItem({ className }: WithClassName) {
  return (
    <div className={`SearchResultsListItem SearchResultsListItem--Loading ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <LoadingLine colorScheme={'gray'} />
        </GridItem>
        <GridItem>
          <LoadingLine colorScheme={'gray'} />
        </GridItem>
        <GridItem>
          <LoadingLine colorScheme={'gray'} />
        </GridItem>
        <GridItem className={'SearchResultsListItem__ArrowButtonContainer'}>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'gray'} />
        </GridItem>
      </Grid>
    </div>
  )
}
