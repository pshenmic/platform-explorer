import { ContendersContent } from './Content'
import { ContendersTemplate } from './Template'

import { useWalletConnect } from '../../../hooks/useWallet'
import { useVoteValidation } from './useVoteValidation'

const ContendersList = ({ className, isFinished, ...props }) => {
  const wallet = useWalletConnect()
  const { isVoteVisible, prevVote } = useVoteValidation({ wallet, isFinished })
  return (
        <ContendersTemplate isVoteVisible={isVoteVisible} className={className}>
            <ContendersContent isVoteVisible={isVoteVisible} prevVote={prevVote} {...wallet} {...props} />
        </ContendersTemplate>
  )
}

export default ContendersList
