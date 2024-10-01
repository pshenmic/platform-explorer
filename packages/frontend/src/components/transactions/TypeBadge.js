import { Badge } from '@chakra-ui/react'
import { getTransitionTypeKeyById } from '../../util/index'
import { TransactionTypesEnum, TransactionTypesColors } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ typeId }) {
  const TransitionTypeKey = getTransitionTypeKeyById(typeId)

  const descriptions = {
    DATA_CONTRACT_CREATE: 'Creates a new data contract. This contract defines the schema for storing and managing data on the platform.',
    DATA_CONTRACT_UPDATE: 'Updates an existing data contract, modifying its schema or rules for data management on the platform.',
    DOCUMENTS_BATCH: 'Batch submission or update of documents that are stored according to a data contract.',
    IDENTITY_CREATE: 'Creates a new decentralized identity (DID) to manage digital assets and actions.',
    IDENTITY_TOP_UP: 'Adds credits to an existing decentralized identity (DID) to support its usage.',
    IDENTITY_UPDATE: 'Updates information or parameters of an existing decentralized identity.',
    IDENTITY_CREDIT_WITHDRAWAL: 'Withdraws credits from the platform, converting them into Dash or other assets.',
    IDENTITY_CREDIT_TRANSFER: 'Transfers credits between decentralized identities or other network participants.'
  }

  return (
    <Tooltip
      title={TransactionTypesEnum[TransitionTypeKey]}
      content={descriptions[TransitionTypeKey]}
      placement={'top'}
    >
      <Badge colorScheme={TransactionTypesColors[TransitionTypeKey]}>
        {TransactionTypesEnum[TransitionTypeKey]}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge
