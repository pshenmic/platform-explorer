import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/blocks/BlocksList.columns'

export default function Loading() {
  return (
    <div className={'ListPage Blocks'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Blocks'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
