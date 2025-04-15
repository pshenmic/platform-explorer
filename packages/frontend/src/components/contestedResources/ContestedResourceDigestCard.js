import { InfoLine } from '../data'
import { LoadingLine } from '../loading'
import './ContestedResourceDigestCard.scss'

function ContestedResourceDigestCard ({ contestedResource, className }) {
  console.log('contestedResource', contestedResource)

  return (
    <div className={`ContestedResourcesDigestCard ${className || ''} ${contestedResource?.loading ? 'ContestedResourcesDigestCard--Loading' : ''}`}>
      <div className={'ContestedResourcesDigestCard__Transfers'}>
        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--TupUp'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Towards Identity</div>
          <LoadingLine loading={contestedResource?.loading}>
            {contestedResource?.data?.totalCountTowardsIdentity}
          </LoadingLine>
        </div>

        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Abstain</div>
          <LoadingLine loading={contestedResource?.loading}>
            {contestedResource?.data?.totalCountAbstain}
          </LoadingLine>
        </div>

        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Locked</div>
          <LoadingLine loading={contestedResource?.loading}>
            {contestedResource?.data?.totalCountLock}
          </LoadingLine>
        </div>
      </div>

      <div className={'ContestedResourcesDigestCard__LinesContainer'}>
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Total Votes'}
          value={contestedResource?.data?.totalCountVotes}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine ContestedResourcesDigestCard__InfoLine--LastWithdrawal'}
          title={'Status'}
          value={contestedResource?.data?.status}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Ends In'}
          value={contestedResource?.data?.endTimestamp}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
      </div>
    </div>
  )
}

export default ContestedResourceDigestCard
