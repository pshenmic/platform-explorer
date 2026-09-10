import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/dataContracts/DataContractsList.columns'

export default function Loading() {
  return (
    <div className={'ListPage DataContractsPage'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Data contracts'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
