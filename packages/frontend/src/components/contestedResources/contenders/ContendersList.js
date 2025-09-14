import { ContendersContent } from './Content'
import { ContendersTemplate } from './Template'

import { checkPlatformExtension, ExtensionStatusEnum } from '../../../util/extension'

const ContendersList = ({ className, isFinished, ...props }) => {
  const isVoteVisible = checkPlatformExtension() === ExtensionStatusEnum.CONNECTED && !isFinished

  return (
        <ContendersTemplate isVoteVisible={isVoteVisible} className={className}>
            <ContendersContent isVoteVisible={isVoteVisible} {...props} />
        </ContendersTemplate>
  )
}

export default ContendersList
