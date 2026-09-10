import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/contestedResources/votes/VotesList.columns'

export default function Loading() {
  return (
    <div className={'ListPage MasternodeVotes'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Masternode votes'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
