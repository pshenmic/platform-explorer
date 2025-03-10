import { Alias, Identifier, TimeDelta } from '../data'
import { Badge, Button, Grid, GridItem } from '@chakra-ui/react'
import { BlockIcon, ChevronIcon, TransactionsIcon } from '../ui/icons'
import Link from 'next/link'
import { LoadingLine } from '../loading'
import './SearchResultsListItem.scss'

function IdentitySearchItem ({ identity, className }) {
  return (
    <Link href={`/identity/${identity?.identifier}`}
          className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          {identity?.alias
            ? <Alias avatarSource={identity?.identifier} ellipsis={true}>{identity?.alias}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{identity?.identifier}</Identifier>
          }
        </GridItem>

        <GridItem>
          <Badge size={'xs'} colorScheme={
            ({
              ok: 'green',
              pending: 'orange',
              locked: 'red'
            })?.[identity?.status?.status] || 'gray'
          }>
            {identity?.status?.status}
          </Badge>
        </GridItem>

        <GridItem>
          <TimeDelta endDate={new Date(identity.timestamp)}/>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function ValidatorSearchItem ({ validator, className }) {
  return (
    <Link href={`/validator/${validator?.proTxHash}`} className={`SearchResultsListItem SearchResultsListItem--validator ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>
        </GridItem>

        <GridItem>
          <Identifier avatar={true} ellipsis={true}>{validator?.identity || 'Unknown'}</Identifier>
        </GridItem>

        <GridItem>
          <Badge size={'xs'} colorScheme={'blue'}>{validator?.balance || '1000'} DASH</Badge>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function TransactionSearchItem ({ transaction, className }) {
  return (
    <Link href={`/transaction/${transaction?.hash}`} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <TransactionsIcon className={'SearchResultsListItem__Icon'}/>
          <Identifier ellipsis={true} styles={['highlight-both']}>{transaction?.hash}</Identifier>
        </GridItem>

        <GridItem>
          <Badge size={'xs'} colorScheme={'gray'}>Pending</Badge>
        </GridItem>

        <GridItem>
          <TimeDelta endDate={transaction?.timestamp || new Date()}/>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function DataContractSearchItem ({ dataContract, className }) {
  return (
    <Link href={`/dataContract/${dataContract?.identifier}`} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          {dataContract?.name
            ? <Alias avatarSource={dataContract?.identifier} ellipsis={true}>{dataContract?.name}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{dataContract?.identifier}</Identifier>
          }
        </GridItem>

        <GridItem>
          <Identifier avatar={true} ellipsis={true}>{dataContract?.ownerId || 'Unknown'}</Identifier>
        </GridItem>

        <GridItem>
          <TimeDelta endDate={dataContract?.timestamp || new Date()}/>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function BlockSearchItem ({ block, className }) {
  return (
    <Link href={`/block/${block?.header?.hash}`} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <BlockIcon className={'SearchResultsListItem__Icon'}/>
          <Identifier ellipsis={true} styles={['highlight-both']}>{block?.header?.hash}</Identifier>
        </GridItem>

        <GridItem>
          <Badge size={'xs'} colorScheme={'gray'}>
            #{block?.header?.height || '0'}
          </Badge>
        </GridItem>

        <GridItem>
          <TimeDelta endDate={block?.timestamp || new Date()}/>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function DocumentSearchItem ({ document, className }) {
  return (
    <Link href={`/document/${document?.identifier}`} className={`SearchResultsListItem ${className || ''}`}>
      <Grid className={'SearchResultsListItem__Content'}>
        <GridItem>
          <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>
        </GridItem>

        <GridItem>
          <Identifier avatar={true} ellipsis={true}>{document?.ownerId || 'Unknown'}</Identifier>
        </GridItem>

        <GridItem>
          <TimeDelta endDate={document?.timestamp || new Date()}/>
        </GridItem>

        <GridItem>
          <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
            <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
          </Button>
        </GridItem>
      </Grid>
    </Link>
  )
}

function LoadingSearchItem ({ className }) {
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

function SearchResultsListItem ({ entity, entityType, className }) {
  if (entityType === 'transaction') {
    return <TransactionSearchItem transaction={entity} className={className}/>
  }

  if (entityType === 'block') {
    return <BlockSearchItem block={entity} className={className}/>
  }

  if (entityType === 'identity') {
    return <IdentitySearchItem identity={entity} className={className}/>
  }

  if (entityType === 'validator') {
    return <ValidatorSearchItem validator={entity} className={className}/>
  }

  if (entityType === 'dataContract') {
    return <DataContractSearchItem dataContract={entity} className={className}/>
  }

  if (entityType === 'document') {
    return <DocumentSearchItem document={entity} className={className}/>
  }

  if (entityType === 'loading') {
    return <LoadingSearchItem className={className}/>
  }

  return null
}

export default SearchResultsListItem
