import { Button } from '@chakra-ui/react'
import { VoteControls } from './VoteControls'

import './VoteManager.scss'

export const VoteManeger = ({ connected, connectWallet, identifier, ...other }) => {
  if (connected) {
    return <VoteControls contender={identifier} {...other} />
  }

  return <Button onClick={connectWallet} className='ContendersListItem__Column_Vote-btn' variant="brand" size="sm">Vote</Button>
}
