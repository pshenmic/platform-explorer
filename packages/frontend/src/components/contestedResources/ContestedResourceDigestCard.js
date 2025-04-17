import {DateBlock, InfoLine, TimeRemaining} from '../data'
import { LoadingLine } from '../loading'
import { VoteStatusValue } from './'
import ChoiceBadge from './ChoiceBadge'
import './ContestedResourceDigestCard.scss'

function ContestedResourceDigestCard ({ contestedResource, className }) {
  const isEnded = new Date() > new Date(contestedResource?.data?.endTimestamp)

  return (
    <div className={`ContestedResourcesDigestCard ${className || ''} ${contestedResource?.loading ? 'ContestedResourcesDigestCard--Loading' : ''}`}>
      <div className={'ContestedResourcesDigestCard__Cards'}>
        <div className={'ContestedResourcesDigestCard__Card ContestedResourcesDigestCard__Card--TupUp'}>
          <div className={'ContestedResourcesDigestCard__CardTitle'}><ChoiceBadge choice={0}/></div>
          <div className={'ContestedResourcesDigestCard__CardValue'}>
            <LoadingLine loading={contestedResource?.loading}>
              {contestedResource?.data?.totalCountTowardsIdentity}
            </LoadingLine>
          </div>
        </div>

        <div className={'ContestedResourcesDigestCard__Card ContestedResourcesDigestCard__Card--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__CardTitle'}><ChoiceBadge choice={1}/></div>
          <div className={'ContestedResourcesDigestCard__CardValue'}>
            <LoadingLine loading={contestedResource?.loading}>
              {contestedResource?.data?.totalCountAbstain}
            </LoadingLine>
          </div>
        </div>

        <div className={'ContestedResourcesDigestCard__Card ContestedResourcesDigestCard__Card--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__CardTitle'}><ChoiceBadge choice={2}/></div>
          <div className={'ContestedResourcesDigestCard__CardValue'}>

            <LoadingLine loading={contestedResource?.loading}>
              {contestedResource?.data?.totalCountLock}
            </LoadingLine>
          </div>
        </div>
      </div>

        <div className={'ContestedResourcesDigestCard__LinesContainer'}>
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Total Votes'}
          value={<span>{contestedResource?.data?.totalCountVotes} Votes</span>}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine ContestedResourcesDigestCard__InfoLine--Status'}
          title={'Status'}
          value={<div className={'ContestedResourcesDigestCard__StatusContainer'}>
            <VoteStatusValue status={contestedResource?.data?.status}/>

            {isEnded &&
              <DateBlock timestamp={contestedResource?.data?.endTimestamp} showTime={true}/>
            }
          </div>}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Ends In'}
          value={
            !isEnded
              ? <TimeRemaining
                  startTime={contestedResource?.timestamp}
                  endTime={contestedResource?.data?.endTimestamp}
                  displayProgress={!isEnded}
                />
              : <>Ended</>
          }
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
      </div>
    </div>
  )
}

export default ContestedResourceDigestCard
