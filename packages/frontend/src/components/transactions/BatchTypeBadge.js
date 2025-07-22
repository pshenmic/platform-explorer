import { Badge } from '@chakra-ui/react'
import { TokenTransitionInfo } from '../../enums/tokenTransition'
import { DocumentActionInfo } from '../../enums/documentAction'
import { Tooltip } from '../ui/Tooltips'

const BatchTypeInfo = {
  ...TokenTransitionInfo,
  ...DocumentActionInfo
}

const batchTypeMapping = {
  // Document actions
  DOCUMENT_CREATE: 'CREATE',
  DOCUMENT_REPLACE: 'REPLACE',
  DOCUMENT_DELETE: 'DELETE',
  DOCUMENT_TRANSFER: 'TRANSFER',
  DOCUMENT_UPDATE_PRICE: 'UPDATE_PRICE',
  DOCUMENT_PURCHASE: 'PURCHASE',
  // Token actions
  TOKEN_BURN: 'BURN',
  TOKEN_MINT: 'MINT',
  TOKEN_TRANSFER: 'TRANSFER',
  TOKEN_FREEZE: 'FREEZE',
  TOKEN_UNFREEZE: 'UNFREEZE',
  TOKEN_DESTROY: 'DESTROY_FROZEN_FUNDS',
  TOKEN_DESTROY_FROZEN_FUNDS: 'DESTROY_FROZEN_FUNDS',
  TOKEN_CLAIM: 'CLAIM',
  TOKEN_EMERGENCY_ACTION: 'EMERGENCY_ACTION',
  TOKEN_CONFIG_UPDATE: 'CONFIG_UPDATE',
  TOKEN_DIRECT_PURCHASE: 'DIRECT_PURCHASE',
  TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE: 'SET_PRICE_FOR_DIRECT_PURCHASE',
}

function BatchTypeBadge ({ batchType, ...props }) {
  const mappedType = batchTypeMapping[batchType]
  const batchInfo = BatchTypeInfo[mappedType]

  if (!batchInfo) {
    return <Badge colorScheme='gray' {...props}>{batchType}</Badge>
  }

  return (
    <Tooltip
      title={batchInfo.title}
      content={batchInfo.description}
      placement={'top'}
    >
      <Badge colorScheme={batchInfo.colorScheme} {...props}>
        {batchInfo.title}
      </Badge>
    </Tooltip>
  )
}

export default BatchTypeBadge
