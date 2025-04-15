import { InfoLine } from '../data'
import { LoadingLine } from '../loading'
import './ContestedResourceDigestCard.scss'

function ContestedResourceDigestCard ({ contestedResource, className }) {
  return (
    <div className={`ContestedResourcesDigestCard ${className || ''} ${contestedResource?.loading ? 'ContestedResourcesDigestCard--Loading' : ''}`}>
      <div className={'ContestedResourcesDigestCard__Transfers'}>
        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--TupUp'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Towards Identity</div>
          <LoadingLine loading={contestedResource?.loading}>
            123
          </LoadingLine>
        </div>

        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Abstain</div>
          <LoadingLine loading={contestedResource?.loading}>
            123
          </LoadingLine>
        </div>

        <div className={'ContestedResourcesDigestCard__Transfer ContestedResourcesDigestCard__Transfer--Withdrawals'}>
          <div className={'ContestedResourcesDigestCard__TransferTitle'}>Locked</div>
          <LoadingLine loading={contestedResource?.loading}>
            123
          </LoadingLine>
        </div>
      </div>

      <div className={'ContestedResourcesDigestCard__LinesContainer'}>
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Total Votes'}
          value={123}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine ContestedResourcesDigestCard__InfoLine--LastWithdrawal'}
          title={'Status'}
          value={123}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
        <InfoLine
          className={'ContestedResourcesDigestCard__InfoLine'}
          title={'Ends In'}
          value={123}
          loading={contestedResource.loading}
          error={contestedResource.error}
        />
      </div>
    </div>
  )
}

export default ContestedResourceDigestCard
