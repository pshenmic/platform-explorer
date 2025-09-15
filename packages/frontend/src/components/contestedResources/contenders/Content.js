import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'

export const ContendersContent = ({ contenders, loading, itemsCount = 10, ...props }) => {
  if (loading) {
    return <LoadingList itemsCount={itemsCount} />
  }

  if (!contenders) {
    return <ErrorMessageBlock />
  }

  if (contenders.lenght === 0) {
    return <EmptyListMessage>There are no contenders</EmptyListMessage>
  }

  return (
    <>
        {contenders.map((contender) => (
            <ContendersListItem key={contender.identifier} contender={contender} {...props} />
        ))}
    </>
  )
}
