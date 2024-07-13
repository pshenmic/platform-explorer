'use client'

import Link from 'next/link'
import { getTransitionTypeString } from '../../util/index'
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons'
import { Tooltip, Box } from '@chakra-ui/react'
import './TransactionsListItem.scss'

function TransactionsListItem ({ transaction }) {
  const hash = typeof transaction === 'object' ? transaction.hash : transaction
  const { timestamp, type } = transaction

  const StatusIcon = transaction.status === 'SUCCESS'
    ? <CheckCircleIcon color={'green.500'}/>
    : <WarningTwoIcon color={'yellow.400'}/>

  return (
    <Link
        href={`/transaction/${hash}`}
        className={'TransactionsListItem'}
    >
        {typeof timestamp === 'string' &&
            <div className={'TransactionsListItem__Timestamp'}>
                  <Tooltip
                      label={transaction.status === 'SUCCESS'
                        ? 'Transaction processed successfully'
                        : 'Transaction processed with error'
                      }
                      aria-label={'A tooltip'}
                      placement={'top'}
                      hasArrow
                      bg={'gray.700'}
                      color={'white'}
                  >
                    <Box mr={4} display={'inline-block'}>{StatusIcon}</Box>
                  </Tooltip>
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
