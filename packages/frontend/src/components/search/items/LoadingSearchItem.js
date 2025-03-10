import { Button, Grid, GridItem } from '@chakra-ui/react'
import { LoadingLine } from '../../loading'

export function LoadingSearchItem ({ className }) {
  return (
    <div className={`SearchResultsListItem SearchResultsListItem--Loading ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <LoadingLine colorScheme={'gray'}/>
        </GridItem>
        <GridItem>
          <LoadingLine colorScheme={'gray'}/>
        </GridItem>
        <GridItem>
          <LoadingLine colorScheme={'gray'}/>
        </GridItem>
        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'gray'}/>
        </GridItem>
      </Grid>
    </div>
  )
}
