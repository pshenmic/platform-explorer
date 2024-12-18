import { Badge } from '@chakra-ui/react'
import { TransactionTypesEnum, TransactionTypesColors } from '../../enums/state.transition.type'
import { Tooltip } from '../ui/Tooltips'

function TypeBadge ({ type, ...props }) {
  const TransferTypesTitle = {
    TOP_UP: 'Credit Top Up',
    CREDIT_WITHDRAWAL: 'Credit Withdrawal',
    CREDIT_TRANSFER: 'Credit Transfer'
  }

  const TransferTransitionTypes = {
    TOP_UP: 'IDENTITY_TOP_UP',
    CREDIT_WITHDRAWAL: 'IDENTITY_CREDIT_WITHDRAWAL',
    CREDIT_TRANSFER: 'IDENTITY_CREDIT_TRANSFER'
  }

  const transitionType = TransferTransitionTypes[type]

  const descriptions = {
    TOP_UP: 'Adds credits to an existing decentralized identity (DID) balance.',
    CREDIT_WITHDRAWAL: 'Withdraws credits from the platform, converting them into Dash.',
    CREDIT_TRANSFER: 'Transfers credits between identities or other network participants.'
  }

  return (
    <Tooltip
      title={TransactionTypesEnum[transitionType]}
      content={descriptions[type]}
      placement={'top'}
    >
      <Badge
        colorScheme={TransactionTypesColors[transitionType]}
        {...props}
      >
        {TransferTypesTitle[type]}
      </Badge>
    </Tooltip>
  )
}

export default TypeBadge
