import DataListSkeleton from '../../components/ui/lists/DataList/DataListSkeleton'
import { columnLayout } from '../../components/validators/ValidatorsList.columns'

export default function Loading() {
  return (
    <div className={'ListPage ValidatorsPage'}>
      <div className={'InfoBlock'}>
        <DataListSkeleton title={'Validators'} columns={Object.values(columnLayout)} />
      </div>
    </div>
  )
}
