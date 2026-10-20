import { MODERATION_ACTION_LABELS } from 'src/enums/contractModeration'
import type { ModerationAction } from 'src/types/ContractModeration'
import InfoLine from '@components/data/InfoLine'
import JsonViewer from '@components/data/JsonViewer'
import {
  DetailLine,
  EntityLine,
  JsonDetails,
  TimestampLine
} from '@components/transactions/TransactionDetails'

interface ContractUserModerationProps {
  dataContractId?: string | null
  ownerId?: string | null
  identityContractNonce?: string | number | null
  action?: ModerationAction | null
}

function ModerationDetails({ action }: { action?: ModerationAction | null }) {
  if (!action) return <DetailLine title="Action">Unavailable</DetailLine>
  const label = MODERATION_ACTION_LABELS[action.type]
  if (!label) return <JsonDetails title="Moderation action" value={action} />
  const reason = action.reason
  const targetsIdentity = [
    'ban',
    'unban',
    'suspend',
    'unsuspend',
    'warn',
    'clearWarnings'
  ].includes(action.type)
  const targetsDocument = [
    'deleteDocument',
    'deleteSettledDocument',
    'changeDocumentFields'
  ].includes(action.type)

  return (
    <>
      <DetailLine title="Action">{label}</DetailLine>
      {targetsIdentity && (
        <EntityLine
          title="Target Identity"
          identifier={'identityId' in action ? action.identityId : null}
          entity="identity"
        />
      )}
      {action.type === 'suspend' && (
        <TimestampLine title="Suspended Until" timestamp={action.until} />
      )}
      {(targetsDocument || action.type === 'restoreDocument') && (
        <DetailLine title="Document Type">
          {'documentTypeName' in action ? action.documentTypeName : null}
        </DetailLine>
      )}
      {targetsDocument && (
        <EntityLine
          title="Document"
          identifier={'documentId' in action ? action.documentId : null}
          entity="document"
        />
      )}
      {action.type === 'approveTeamAction' && (
        <EntityLine title="Action ID" identifier={action.actionId} />
      )}
      {action.type === 'restoreDocument' && (
        <JsonDetails title="Serialized document" value={action.document} />
      )}
      {action.type === 'changeDocumentFields' && (
        <InfoLine
          className="TransactionPage__InfoLine TransactionPage__InfoLine--Schema"
          title="Changed fields"
          value={action.fields == null ? 'Unavailable' : <JsonViewer value={action.fields} />}
        />
      )}
      {reason?.code != null && <DetailLine title="Reason Code">{reason.code}</DetailLine>}
      {reason?.text != null && <DetailLine title="Reason">{reason.text}</DetailLine>}
      {reason?.reasonDocumentId && (
        <EntityLine
          title="Reason Document"
          identifier={reason.reasonDocumentId}
          entity="document"
        />
      )}
      {reason?.documents?.map((document, index) => (
        <EntityLine
          key={`${document.documentId}-${index}`}
          title={`Related Document (${document.documentTypeName})`}
          identifier={document.documentId}
          entity="document"
        />
      ))}
    </>
  )
}

export function ContractUserModeration({
  dataContractId,
  ownerId,
  identityContractNonce,
  action
}: ContractUserModerationProps) {
  return (
    <>
      <EntityLine title="Data Contract" identifier={dataContractId} entity="dataContract" />
      <EntityLine title="Actor" identifier={ownerId} entity="identity" />
      <DetailLine title="Identity Contract Nonce">{identityContractNonce}</DetailLine>
      <ModerationDetails action={action} />
    </>
  )
}
