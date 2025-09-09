import { IconButton } from '@chakra-ui/react'
import { PrimalPostitiveIcon, PrimalNegativeIcon, CloseIcon } from '../../ui/icons'
import { useSDK } from '../../../hooks/useSDK'

import './VoteControls.scss'

const dataContractId = '4P7d1iqwofPA1gFtbEcXiagDnANXAQhX2WZararioX8f'

const VoteEnum = {
  TO_APPROVE: 'TO_APPROVE',
  TO_REJECT: 'TO_REJECT',
  TO_ABSTAIN: 'TO_ABSTAIN'
}

const VoteMsg = {
  [VoteEnum.TO_APPROVE]: 'to approve',
  [VoteEnum.TO_REJECT]: 'to reject',
  [VoteEnum.TO_ABSTAIN]: 'to abstain'
}

export const VoteControls = ({ currentIdentity, contender }) => {
  const sdk = useSDK()

  const handleVoite = (voite) => {
    if (!window.dashPlatformExtension) {
      return
    }

    const sendVoite = async () => {
      const message = voite === VoteEnum.TO_APPROVE ? `${VoteMsg[voite]} for ${contender}` : VoteMsg[voite]
      const data = {
        message
      }

      if (!currentIdentity) {
        throw new Error('Current Identity not set')
      }

      const document = await sdk.documents.create(dataContractId, 'posts', data, currentIdentity)

      const identityContractNonce = await sdk.identities.getIdentityContractNonce(currentIdentity, dataContractId)

      const stateTransition = sdk.documents.createStateTransition(document, 'create', identityContractNonce + 1n)

      await window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)
    }

    sendVoite()
  }

  return (
        <div className="VoteControls">
            <IconButton
                color="#58F4BC"
                bg="#58F4BC26"
                _hover={{ bg: '#58F4BC4D' }}
                _active={{ bg: '#58F4BC', color: '#21272C' }}

                size="30px"
                aria-label="vote"
                p={0}
                icon={<PrimalPostitiveIcon width="18px" height="10px" />}
                onClick={() => handleVoite(VoteEnum.TO_APPROVE)}
            />
            <IconButton
                color="#F49A58"
                bg="#F49A5826"
                _hover={{ bg: '#F49A584D' }}
                _active={{ bg: '#F49A58', color: '#21272C' }}

                size="30px"
                aria-label="vote"
                p={0}
                icon={<PrimalNegativeIcon width="11px" height="10px" />}
                onClick={() => handleVoite(VoteEnum.TO_REJECT)}
            />
            <IconButton
                color="#F45858"
                bg="#F4585826"
                _hover={{ bg: '#F458584D' }}
                _active={{ bg: '#F45858', color: '#21272C' }}

                size="30px"
                aria-label="vote"
                p={0}
                icon={<CloseIcon width="8px" height="8px" />}
                onClick={() => handleVoite(VoteEnum.TO_ABSTAIN)}
            />
        </div>
  )
}
