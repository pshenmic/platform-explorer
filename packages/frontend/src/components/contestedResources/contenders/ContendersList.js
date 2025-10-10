import { ContendersContent } from './Content'
import { ContendersTemplate } from './Template'

import { useWalletConnect } from '../../../hooks/useWallet'
import { useVoteValidation } from './useVoteValidation'

const ContendersList = ({ className, isFinished, ...props }) => {
  const wallet = useWalletConnect()
  const { isVoteVisible } = useVoteValidation({ wallet, isFinished })
  return (
        <ContendersTemplate isVoteVisible={isVoteVisible} className={className}>
            <ContendersContent isVoteVisible={isVoteVisible} {...wallet} {...props} />
        </ContendersTemplate>
  )
}

export default ContendersList
