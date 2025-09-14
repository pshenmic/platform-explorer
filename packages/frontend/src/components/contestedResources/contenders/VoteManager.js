import { Button } from '@chakra-ui/react'
import { VoteControls } from './VoteControls'

import './VoteManager.scss'

export const VoteManeger = ({ connected, currentIdentity, connectWallet, documentStateTransition, identifier }) => {
  if (connected) {
    return <VoteControls proTxHash={documentStateTransition} contender={identifier} currentIdentity={currentIdentity} />
  }

  return <Button onClick={connectWallet} className='ContendersListItem__Column_Vote-btn' variant="brand" size="sm">Vote</Button>
}
