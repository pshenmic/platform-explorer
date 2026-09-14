import { ErrorMessageBlock } from '../../Errors'
import { LoadingList } from '../../loading'
import { EmptyListMessage } from '../../ui/lists'
import ContendersListItem from './ContendersListItem'
import type { Contender } from './ContendersListItem'
import type { VoteControlStateValue } from './useVoteValidation'
import type { VoteEnumValue } from './constants'
import type { WalletInfo } from 'src/contexts'

interface ContendersContentProps {
  contenders?: Contender[] | null
  loading?: boolean
  itemsCount?: number
  isVoteVisible?: boolean
  prevVote?: VoteEnumValue | null
  voteValidateState?: VoteControlStateValue
  connectWallet?: () => void
  isConnecting?: boolean
  walletInfo?: WalletInfo | null
  currentIdentity?: string | null
  resourceValue?: string[] | unknown
  refresh?: () => void
  isPollingAfterVote?: boolean
  [key: string]: unknown
}

export const ContendersContent = ({
  contenders,
  loading,
  itemsCount = 10,
  ...props
}: ContendersContentProps) => {
  if (loading) {
    return <LoadingList itemsCount={itemsCount} />
  }

  if (!contenders) {
    return <ErrorMessageBlock />
  }

  // Keep original typo `lenght` behavior: this branch never matched at runtime.
  if ((contenders as { lenght?: number }).lenght === 0) {
    return <EmptyListMessage>There are no contenders</EmptyListMessage>
  }

  return (
    <>
      {contenders.map(contender => (
        <ContendersListItem key={contender.identifier} contender={contender} {...props} />
      ))}
    </>
  )
}
