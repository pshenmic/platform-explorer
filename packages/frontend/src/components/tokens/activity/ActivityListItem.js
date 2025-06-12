import { LinkContainer } from '../../ui/containers'
import { StatusIcon } from '../../ui/status'
import { TypeLabel } from '../../ui/labels'
import { Identifier, NotActive } from '../../data'
import { useRouter } from 'next/navigation'
import './ActivityListItem.scss'

export default function ActivityListItem ({ activity }) {
  const router = useRouter()

  const formatAmount = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60))

    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes} m. ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} h. ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} d. ago`
  }

  const getActivityTypeConfig = (type) => {
    const configs = {
      transfer: { color: 'green', label: 'Transfer' },
      mint: { color: 'blue', label: 'Mint' },
      burn: { color: 'red', label: 'Burn' },
      freeze: { color: 'gray', label: 'Freeze' },
      unfreeze: { color: 'orange', label: 'Unfreeze' },
      destroy: { color: 'red', label: 'Destroy' },
      claim: { color: 'green', label: 'Claim' },
      emergency: { color: 'red', label: 'Emergency' }
    }
    return configs[type?.toLowerCase()] || { color: 'gray', label: type || 'Unknown' }
  }

  const Creator = () => {
    if (!activity?.creator) return <NotActive>-</NotActive>

    return (
      <LinkContainer
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          router.push(`/identity/${activity?.creator}`)
        }}
      >
        <Identifier
          avatar={true}
          styles={['highlight-both']}
          clickable={true}
        >
          {activity.creator}
        </Identifier>
      </LinkContainer>
    )
  }

  const Recipient = () => {
    if (!activity?.recipient) return <NotActive>-</NotActive>

    return (
      <LinkContainer
        onClick={e => {
          e.stopPropagation()
          e.preventDefault()
          router.push(`/identity/${activity?.recipient}`)
        }}
      >
        <Identifier
          avatar={true}
          styles={['highlight-both']}
          clickable={true}
        >
          {activity.recipient}
        </Identifier>
      </LinkContainer>
    )
  }

  const typeConfig = getActivityTypeConfig(activity?.type)

  return (
    <div className={'ActivityListItem'}>
      <StatusIcon status={activity?.status || 'completed'} className={'ActivityListItem__StatusIcon'} />

      <div className={'ActivityListItem__Content'}>
        <div className={'ActivityListItem__Column ActivityListItem__Column--Timestamp'}>
          {formatTime(activity?.timestamp)}
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Hash'}>
          {activity?.txHash
            ? <Identifier styles={['highlight-both']}>{activity.txHash}</Identifier>
            : <NotActive/>
          }
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Amount'}>
          {formatAmount(activity?.amount)}
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Creator'}>
          <Creator/>
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Recipient'}>
          <Recipient/>
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Type'}>
          <TypeLabel
            type={typeConfig.label}
            colorScheme={typeConfig.color}
            className={'ActivityListItem__TypeLabel'}
          />
        </div>
      </div>
    </div>
  )
}
