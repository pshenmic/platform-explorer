import { Badge } from '@chakra-ui/react'
import { DocumentActionEnum, DocumentActionInfo } from '../../enums/documentAction'
import { Tooltip } from '../ui/Tooltips'

function DocumentActionBadge ({ typeId }) {
  const TransitionTypeKey = DocumentActionEnum[typeId]
  const actionInfo = DocumentActionInfo[TransitionTypeKey]

  if (!actionInfo) return null

  return (
    <Tooltip
      title={actionInfo?.title}
      content={actionInfo?.description}
      placement={'top'}
    >
      <Badge colorScheme={actionInfo?.colorScheme}>
        {actionInfo?.title}
      </Badge>
    </Tooltip>
  )
}

export default DocumentActionBadge
