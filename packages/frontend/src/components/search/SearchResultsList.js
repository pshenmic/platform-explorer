import SearchResultsListItem from './SearchResultsListItem'
import './SearchResultsList.scss'
import { Grid, GridItem, Button } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import Link from 'next/link'

function ListCategory ({ type, data }) {
  if (type === 'block') return

  const singularCategoryMap = {
    transactions: 'transaction',
    dataContracts: 'dataContract',
    documents: 'document',
    identities: 'identity',
    blocks: 'block',
    validators: 'validator'
  }

  return (
    <div className={'SearchResultsList__Category'}>
      <Grid className={'SearchResultsList__ColumnTitles'}>
        <GridItem className={'SearchResultsList__ColumnTitle'}>
          {singularCategoryMap[type]}
        </GridItem>
        <GridItem className={'SearchResultsList__ColumnTitle'}>
          {type === 'validators' && 'Identity'}
          {type === 'identities' && 'Status'}
          {type === 'dataContracts' && 'Identity'}
          {type === 'blocks' && 'Epoch'}
          {type === 'documents' && 'Identity'}
        </GridItem>
        <GridItem className={'SearchResultsList__ColumnTitle'}>
          {type === 'validators' ? 'Balance' : 'Time'}
        </GridItem>
        <GridItem/>
      </Grid>
      <div>
        {data?.map((entity, i) => (
          <SearchResultsListItem
            entity={entity}
            entityType={singularCategoryMap[type]}
            key={i}
          />
        ))}
      </div>
    </div>
  )
}

const SearchItemLayout = ({ href, className, mainContent, additionalContent, timestamp, children }) => (
  <Link href={href} className={`SearchResultsListItem ${className || ''}`}>
    <Grid className={'SearchResultsListItem__Content'}>
      <GridItem>{mainContent}</GridItem>
      <GridItem>{additionalContent}</GridItem>
      <GridItem>{timestamp}</GridItem>
      <GridItem>
        <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
          <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
        </Button>
      </GridItem>
    </Grid>
  </Link>
)

function SearchResultsList ({ results }) {
  return (
    <div className={'SearchResultsList'}>
      {results.loading &&
        <SearchResultsListItem entityType={'loading'}/>
      }

      {results.error &&
        <div className={'SearchResultsList__Title SearchResultsList__Title--NotFound'}>Nothing found</div>
      }

      {results.data && Object?.entries(results.data)?.length > 0 &&
        Object.entries(results.data).map(([category, items]) => (
          <ListCategory key={category} type={category} data={items}/>
        ))
      }
    </div>
  )
}

export default SearchResultsList
