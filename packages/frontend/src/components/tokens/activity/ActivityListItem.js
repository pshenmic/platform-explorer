import { LinkContainer } from '../../ui/containers'
import { StatusIcon } from '../../ui/status'
import { BigNumber, Identifier, NotActive, TimeDelta } from '../../data'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import TokenTransitionBadge from '../TokenTransitionBadge'
import { Tooltip } from '../../ui/Tooltips'
import './ActivityListItem.scss'

export default function ActivityListItem ({ activity }) {
  const router = useRouter()

  return (
    <Link
      href={`/transaction/${activity?.txHash}`}
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

        <div className={'ActivityListItem__Column ActivityListItem__Column--Amount ActivityListItem__Column--Number'}>
          <BigNumber>{activity?.amount}</BigNumber>
        </div>

        <div className={'ActivityListItem__Column ActivityListItem__Column--Type'}>
          <TokenTransitionBadge typeId={activity?.type} className={'ActivityListItem__TypeLabel'}/>
        </div>
      </div>
    </Link>
  )
}
