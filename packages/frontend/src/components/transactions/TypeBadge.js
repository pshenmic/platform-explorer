import { Badge } from '@chakra-ui/react'
import { getTransitionTypeKeyById } from '../../util/index'
import { TransactionTypesEnum, TransactionTypesColors } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ typeId }) {
  const TransitionTypeKey = getTransitionTypeKeyById(typeId)

  const descriptions = {
    DATA_CONTRACT_CREATE: 'Creates a new data contract. This contract defines the schema for storing data on the platform.',
    DATA_CONTRACT_UPDATE: 'Updates an existing data contract. Increments the version and updates the schema of the data contract',
    DOCUMENTS_BATCH: 'Creates a new document transitions. It is used to make create, modify, delete other document actions on the platform.',
    IDENTITY_CREATE: 'Creates a new decentralized identity (DID) to manage digital assets and make actions.',
    IDENTITY_TOP_UP: 'Adds credits to an existing decentralized identity (DID) balance.',
    IDENTITY_UPDATE: 'Updates an identity by adding and removing associated public keys.',
    IDENTITY_CREDIT_WITHDRAWAL: 'Withdraws credits from the platform, converting them into Dash.',
    IDENTITY_CREDIT_TRANSFER: 'Transfers credits between identities or other network participants.',
    MASTERNODE_VOTE: 'Vote for a contested resource on the Dash Platform'
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
