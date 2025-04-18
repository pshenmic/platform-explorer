import { DateBlock, Identifier, InfoLine, TimeRemaining } from '../data'
import { LoadingLine } from '../loading'
import { VoteStatusValue } from './'
import { ValueCard } from '../cards'
import ChoiceBadge from './ChoiceBadge'
import { ValueContainer } from '../ui/containers'
import { LockIcon } from '../ui/icons'
import { Flex } from '@chakra-ui/react'
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

        {!isEnded
          ? <InfoLine
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
          : contestedResource?.towardsIdentity
            ? <InfoLine
              className={'ContestedResourcesDigestCard__InfoLine'}
              title={'Winner'}
              value={
                <ValueCard link={`/identity/${contestedResource?.towardsIdentity}`} className={'TransactionPage__BlockHash'}>
                  <Identifier avatar={true} styles={['highlight-both']}>
                    {contestedResource?.towardsIdentity}
                  </Identifier>
                </ValueCard>
              }
              loading={contestedResource.loading}
              error={contestedResource.error}
            />
            : <ValueContainer colorScheme={'red'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                  <span>Locked</span>
                  <LockIcon/>
                </Flex>
              </ValueContainer>
        }
      </div>
    </div>
  )
}

export default ContestedResourceDigestCard
