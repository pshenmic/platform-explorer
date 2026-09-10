import { ContendersContent } from './Content'
import { ContendersTemplate } from './Template'
import type { Contender } from './ContendersListItem'

import { useWallet } from '../../../contexts'
import { useVoteValidation } from './useVoteValidation'
import type { WithClassName } from '../../../types'

interface ContendersListProps extends WithClassName {
  isFinished?: boolean
  contenders?: Contender[] | null
  loading?: boolean
  itemsCount?: number
  resourceValue?: string[] | unknown
  refresh?: () => void
  isPollingAfterVote?: boolean
}

const ContendersList = ({ className, isFinished, ...props }: ContendersListProps) => {
  const wallet = useWallet()
  const { isVoteVisible, prevVote, voteValidateState } = useVoteValidation({ wallet, isFinished })
  return (
    <ContendersTemplate isVoteVisible={isVoteVisible} className={className}>
      <ContendersContent
        isVoteVisible={isVoteVisible}
        prevVote={prevVote}
        voteValidateState={voteValidateState}
        connectWallet={wallet.connectWallet}
        isConnecting={wallet.isConnecting}
        walletInfo={wallet.walletInfo}
        currentIdentity={wallet.currentIdentity}
        {...props}
      />
    </ContendersTemplate>
  )
}

export default ContendersList
