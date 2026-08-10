import { Badge } from '@chakra-ui/react'
import { ErrorCircleIcon, CheckmarkIcon } from '../ui/icons'
import type { TransactionStatus } from '../../types'
import './TransactionStatusBadge.scss'

interface TransactionStatusBadgeProps {
  status?: TransactionStatus | string | null
}

function TransactionStatusBadge ({ status }: TransactionStatusBadgeProps) {
  const StatusIcon = status === 'SUCCESS'
    ? <CheckmarkIcon w={'12px'} h={'12px'} mr={'5px'}/>
    : <ErrorCircleIcon w={'12px'} h={'12px'} mr={'5px'}/>

  return (
    <Badge
      className={'TransactionStatusBadge'}
      lineHeight={'20px'}
      colorScheme={status === 'SUCCESS' ? 'green' : 'red'}
    >
      {StatusIcon}
      {status}
    </Badge>
  )
}

export default TransactionStatusBadge
