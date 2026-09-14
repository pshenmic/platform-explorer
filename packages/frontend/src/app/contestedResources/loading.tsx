import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/contestedResources/ContestedResourcesList.columns'

export default function Loading() {
  return (
    <div className={'ListPage ContestedResources ContestedResourcesPage'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Contested resources'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
