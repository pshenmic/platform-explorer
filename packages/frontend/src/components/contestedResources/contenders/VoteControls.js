import { IconButton } from '@chakra-ui/react'
import { PrimalPostitiveIcon, PrimalNegativeIcon, CloseIcon } from '../../ui/icons'

import './VoteControls.scss'

const VoteEnum = {
  TO_REJECT: 'lock',
  TO_ABSTAIN: 'abstain'
}

const VOTING_DATA_CONTRACT_ID = process.env.NEXT_PUBLIC_VOTING_DATA_CONTRACT_ID ?? 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec'
const DOCUMENT_TYPE = 'domain'
const INDEX_NAME = 'parentNameAndLabel'

export const VoteControls = ({ proTxHash, currentIdentity, contender }) => {
  const handleVote = ({ choice }) => {
    if (!window.dashPlatformExtension) {
      return
    }

    const castVote = async () => {
      if (!currentIdentity) {
        throw new Error('Current Identity not set')
      }

      const sdk = window.dashPlatformSDK
      const indexValues = ['dash', sdk.names.normalizeLabel('testidentity')]
      const voterIdentity = await sdk.identities.getIdentityByIdentifier(currentIdentity)
      // const [identityPublicKey] = voterIdentity.getPublicKeys().filter(identityPublicKey => privateKey.getPublicKeyHash() === identityPublicKey.getPublicKeyHash())
      const identityNonce = await sdk.identities.getIdentityNonce(voterIdentity.id)

      const vote = sdk.voting.createVote(VOTING_DATA_CONTRACT_ID, DOCUMENT_TYPE, INDEX_NAME, indexValues, choice)
      const stateTransition = sdk.voting.createStateTransition(vote, proTxHash, voterIdentity.id, identityNonce + BigInt(1))
      await window.dashPlatformExtension.signer.signAndBroadcast(stateTransition)
      console.log({ stateTransition })
    }

    castVote()
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
                onClick={() => handleVote({ choice: contender })}
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
                onClick={() => handleVote({ choice: VoteEnum.TO_REJECT })}
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
                onClick={() => handleVote({ choice: VoteEnum.TO_ABSTAIN })}
            />
        </div>
  )
}
