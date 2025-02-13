import './QuorumMembersListItem.scss'

function QuorumMembersListItem ({ member }) {
  console.log('QuorumMember', member)

  return (
    <div className={'QuorumListItem'}>
      {member?.proTxHash}
      {member?.pubKeyOperator}
      {member?.service}
      {member?.valid}
    </div>
  )
}

export default QuorumMembersListItem
