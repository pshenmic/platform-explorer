'use client'

import Link from 'next/link'
import { getTransitionTypeString } from '../../util/index'
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction }) {
  const hash = typeof transaction === 'object' ? transaction.hash : transaction
  const { timestamp, type } = transaction

  const statusIcon = transaction.status === 'SUCCESS'
    ? <CheckCircleIcon color={'green.500'} mr={4}/>
    : <WarningTwoIcon color={'yellow.400'} mr={4}/>

  return (
    <Link
        href={`/transaction/${hash}`}
        className={'TransactionsListItem'}
    >
        {typeof timestamp === 'string' &&
            <div className={'TransactionsListItem__Timestamp'}>
                {statusIcon}
                {new Date(timestamp).toLocaleString()}
            </div>
        }

        {typeof hash === 'string' &&
            <div className={'TransactionsListItem__Identifier'}>
                {hash}
            </div>
        }

        {typeof type === 'number' &&
            <div className={'TransactionsListItem__Type'}>
                {getTransitionTypeString(type)}
            </div>
        }
    </Link>
  )
}

export default TransactionsListItem
