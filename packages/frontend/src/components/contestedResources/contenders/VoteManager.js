import { Button } from '@chakra-ui/react'
import { VoteControls } from './VoteControls'

import './VoteManager.scss'

export const VoteManeger = ({ connected, currentIdentity, connectWallet, identifier, resourceValue }) => {
  if (connected) {
    return <VoteControls contender={identifier} currentIdentity={currentIdentity} resourceValue={resourceValue} />
  }

  return <Button onClick={connectWallet} className='ContendersListItem__Column_Vote-btn' variant="brand" size="sm">Vote</Button>
}
