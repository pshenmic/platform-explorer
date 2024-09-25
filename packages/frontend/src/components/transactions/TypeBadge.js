import { Badge } from '@chakra-ui/react'
import { getTransitionTypeStringById, getTransitionTypeKeyById } from '../../util/index'
import { TransactionTypesEnum, TransactionTypesColors } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ typeId }) {
  const TransitionTypeKey = getTransitionTypeKeyById(typeId)

  const info = {
    DATA_CONTRACT_CREATE: {
      title: TransactionTypesEnum.DATA_CONTRACT_CREATE,
      content: 'Creates a new data contract. This contract defines the schema for storing and managing data on the platform.'
    },
    DATA_CONTRACT_UPDATE: {
      title: TransactionTypesEnum.DATA_CONTRACT_UPDATE,
      content: 'Updates an existing data contract, modifying its schema or rules for data management on the platform.'
    },
    DOCUMENTS_BATCH: {
      title: TransactionTypesEnum.DOCUMENTS_BATCH,
      content: 'Batch submission or update of documents that are stored according to a data contract.'
    },
    IDENTITY_CREATE: {
      title: TransactionTypesEnum.IDENTITY_CREATE,
      content: 'Creates a new decentralized identity (DID) to manage digital assets and actions.'
    },
    IDENTITY_TOP_UP: {
      title: TransactionTypesEnum.IDENTITY_TOP_UP,
      content: 'Adds credits to an existing decentralized identity (DID) to support its usage.'
    },
    IDENTITY_UPDATE: {
      title: TransactionTypesEnum.IDENTITY_UPDATE,
      content: 'Updates information or parameters of an existing decentralized identity.'
    },
    IDENTITY_CREDIT_WITHDRAWAL: {
      title: TransactionTypesEnum.IDENTITY_CREDIT_WITHDRAWAL,
      content: 'Withdraws credits from the platform, converting them into Dash or other assets.'
    },
    IDENTITY_CREDIT_TRANSFER: {
      title: TransactionTypesEnum.IDENTITY_CREDIT_TRANSFER,
      content: 'Transfers credits between decentralized identities or other network participants.'
    }
  }

  return (
    <Tooltip
      title={info[TransitionTypeKey].title}
      content={info[TransitionTypeKey].content}
      placement={'top'}
    >
      <Badge colorScheme={TransactionTypesColors[TransitionTypeKey]}>
        {getTransitionTypeStringById(typeId)}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge
