import { Alias, Identifier } from '../data'
import { Badge, Button } from '@chakra-ui/react'
import { ChevronIcon, TransactionsIcon } from '../ui/icons'
import './SearchResultsListItem.scss'

function IdentitySearchItem ({ identity, className }) {
  return (
    <div className={`SearchResultsListItem ${className || ''}`}>
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
    </div>
  )
}

function ValidatorSearchItem ({ validator, className }) {
  return (
    <div className={`SearchResultsListItem ${className || ''}`}>
      <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{validator?.proTxHash}</Identifier>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </div>
  )
}

function TransactionSearchItem ({ transaction, className }) {
  return (
    <div className={`SearchResultsListItem ${className || ''}`}>
      <TransactionsIcon className={'SearchResultsListItem__Icon'}/>

      <Identifier ellipsis={true} styles={['highlight-both']}>{transaction?.hash}</Identifier>

      <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
        <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
      </Button>
    </div>
  )
}

function SearchResultsListItem ({ entity, entityType, className }) {
  if (entityType === 'transaction') {
    return <TransactionSearchItem transaction={entity} className={className}/>
  }

  if (entityType === 'identity') {
    return <IdentitySearchItem identity={entity} className={className}/>
  }

  if (entityType === 'validator') {
    return <ValidatorSearchItem validator={entity} className={className}/>
  }

  if (entityType === 'datacontract') {
    return (
      <div className={`SearchResultsListItem ${className || ''}`}>
        {entity?.name
          ? <Alias avatarSource={entity?.identifier} ellipsis={true}>{entity?.name}</Alias>
          : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{entity?.identifier}</Identifier>
        }

        <Button className={'SearchResultsListItem__ArrowButton'} size={'xxs'} variant={'blue'}>
          <ChevronIcon w={'0.5rem'} h={'0.5rem'}/>
        </Button>
      </div>
    )
  }

  return null
}

export default SearchResultsListItem
