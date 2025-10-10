import { LinkContainer } from '../../ui/containers'
import { StatusIcon } from '../../transactions'
import { Identifier, NotActive, TimeDelta } from '../../data'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BatchTypeBadge from '../../transactions/BatchTypeBadge'
import { Tooltip } from '../../ui/Tooltips'
import './ActivityListItem.scss'
import { FormattedNumber } from '../../ui/FormattedNumber'

export default function ActivityListItem ({ activity, decimals }) {
  const router = useRouter()

  return (
    <Link
      href={`/transaction/${activity?.stateTransitionHash}`}
      className={'ActivityListItem'}
    >
      <div className={'ActivityListItem__Content'}>
        <div className={'ActivityListItem__Column ActivityListItem__Column--Timestamp'}>
          {activity?.status &&
            <Tooltip
              title={activity?.status}
              content={activity?.error || ''}
              placement={'top'}
            >
              <span>
                <StatusIcon
                  className={'TransactionsListItem__StatusIcon'}
                  status={activity?.status}
                  w={'1.125rem'}
                  h={'1.125rem'}
                  mr={'0.5rem'}
                />
              </span>
            </Tooltip>
          }
          <TimeDelta endDate={activity?.timestamp}/>
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Hash'}>
          {activity?.stateTransitionHash
            ? <Identifier styles={['highlight-both']}>{activity.stateTransitionHash}</Identifier>
            : <NotActive/>
          }
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Creator'}>
          {activity.owner
            ? <LinkContainer
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  router.push(`/identity/${activity?.owner?.identifier}`)
                }}
              >
                <Identifier
                  avatar={true}
                  styles={['highlight-both']}
                  clickable={true}
                >
                  {activity.owner?.identifier}
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

        <div className={'ActivityListItem__Column ActivityListItem__Column--Amount ActivityListItem__Column--Number'}>
          <FormattedNumber decimals={decimals}>{activity?.amount}</FormattedNumber>
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Type'}>
          {activity?.action != null
            ? <BatchTypeBadge
                batchType={activity?.action}
                className={'ActivityListItem__TypeLabel'}
              />
            : <NotActive/>
          }
        </div>
      </div>
    </Link>
  )
}
