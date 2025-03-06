import { Alias, Identifier } from '../data'
import { Badge, Button } from '@chakra-ui/react'
import { BlockIcon, ChevronIcon, TransactionsIcon } from '../ui/icons'
import Link from 'next/link'
import { LoadingLine } from '../loading'
import './SearchResultsListItem.scss'

function IdentitySearchItem ({ identity, className }) {
  return (
    <Link href={`/identity/${identity?.identifier}`} className={`SearchResultsListItem ${className || ''}`}>
      {identity?.alias
        ? <Alias avatarSource={identity?.identifier} ellipsis={true}>{identity?.alias}</Alias>
        : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{identity?.identifier}</Identifier>
      }

      {identity?.status?.status &&
        <Badge size={'xs'} colorScheme={
          ({
            ok: 'green',
            pending: 'orange',
            locked: 'red'
          })?.[identity?.status?.status] || 'gray'
        }>
          {identity?.status?.status}
        </Badge>
      }

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function ValidatorSearchItem ({ validator, className }) {
  return (
    <Link href={`/validator/${validator?.proTxHash}`} className={`SearchResultsListItem ${className || ''}`}>
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function TransactionSearchItem ({ transaction, className }) {
  return (
    <Link href={`/transaction/${transaction?.hash}`} className={`SearchResultsListItem ${className || ''}`}>
      <TransactionsIcon className={'SearchResultsListItem__Icon'}/>

      <Identifier ellipsis={true} styles={['highlight-both']}>{transaction?.hash}</Identifier>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function DataContractSearchItem ({ dataContract, className }) {
  return (
    <Link href={`/dataContract/${dataContract?.identifier}`} className={`SearchResultsListItem ${className || ''}`}>
      {dataContract?.name
        ? <Alias avatarSource={dataContract?.identifier} ellipsis={true}>{dataContract?.name}</Alias>
        : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{dataContract?.identifier}</Identifier>
      }

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function BlockSearchItem ({ block, className }) {
  return (
    <Link href={`/dataContract/${block?.header?.hash}`} className={`SearchResultsListItem ${className || ''}`}>
      <BlockIcon className={'SearchResultsListItem__Icon'}/>

      <Identifier ellipsis={true} styles={['highlight-both']}>{block?.header?.hash}</Identifier>

      {block?.header?.height &&
        <Badge size={'xs'} colorScheme={'dimGray'}>
          #{block?.header?.height}
        </Badge>
      }

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function DocumentSearchItem ({ document, className }) {
  return (
    <Link href={`/dataContract/${document?.identifier}`} className={`SearchResultsListItem ${className || ''}`}>
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{document?.identifier}</Identifier>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </Link>
  )
}

function LoadingSearchItem ({ className }) {
  return (
    <div className={`SearchResultsListItem SearchResultsListItem--Loading ${className || ''}`}>
      <LoadingLine colorScheme={'gray'}/>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'gray'}/>
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
