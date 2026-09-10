import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/identities/IdentitiesList.columns'

export default function Loading() {
  return (
    <div className={'ListPage IdentitiesPage'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Identities'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
