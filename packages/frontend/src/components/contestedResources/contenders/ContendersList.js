import { ContendersContent } from './Content'
import { ContendersTemplate } from './Template'

import { useWallet } from '../../../contexts'
import { useVoteValidation } from './useVoteValidation'

const ContendersList = ({ className, isFinished, ...props }) => {
  const wallet = useWallet()
  const { isVoteVisible, prevVote, voteValidateState } = useVoteValidation({ wallet, isFinished })
  return (
        <ContendersTemplate isVoteVisible={isVoteVisible} className={className}>
            <ContendersContent isVoteVisible={isVoteVisible} prevVote={prevVote} voteValidateState={voteValidateState} {...wallet} {...props} />
        </ContendersTemplate>
  )
}

export default ContendersList
