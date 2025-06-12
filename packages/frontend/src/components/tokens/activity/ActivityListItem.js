import { LinkContainer } from '../../ui/containers'
import { StatusIcon } from '../../ui/status'
import { Identifier, NotActive } from '../../data'
import { useRouter } from 'next/navigation'
import TokenTransitionBadge from '../TokenTransitionBadge'
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

  return (
    <div className={'ActivityListItem'}>
      <div className={'ActivityListItem__Content'}>
        <div className={'ActivityListItem__Column ActivityListItem__Column--Timestamp'}>
          <StatusIcon status={activity?.status || 'completed'} className={'ActivityListItem__StatusIcon'}/>
          {formatTime(activity?.timestamp)}
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Hash'}>
          {activity?.txHash
            ? <Identifier styles={['highlight-both']}>{activity.txHash}</Identifier>
            : <NotActive/>
          }
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Creator'}>
          {activity.creator
            ? <LinkContainer
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
            : <NotActive>-</NotActive>
          }
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Recipient'}>
          {activity?.recipient
            ? <LinkContainer
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
            : <NotActive>-</NotActive>
          }
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Amount'}>
          {formatAmount(activity?.amount)}
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Type'}>
          <TokenTransitionBadge typeId={activity?.type} className={'ActivityListItem__TypeLabel'}/>
        </div>
      </div>
    </div>
  )
}
