import { Grid, GridItem } from '@chakra-ui/react'
import PublicKeysListItem from './PublicKeysListItem'
import { EmptyListMessage } from '../ui/lists'
import './PublicKeysList.scss'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysList ({ publicKeys = [], className }) {
  return (
    <div className={`PublicKeysList ${className || ''}`}>
      <Grid className={'PublicKeysList__ColumnTitles'}>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Timestamp'}>
          Key Id
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Hash'}>
          Public Key Hash
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--GasUsed'}>
          Type
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Owner'}>
          Purpose
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
          Security Level
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
          Read only
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
          Data
        </GridItem>
      </Grid>

      {publicKeys?.length > 0 &&
        publicKeys.map((publicKey, i) => <PublicKeysListItem publicKey={publicKey} key={i}/>)
      }

      {publicKeys?.length === 0 &&
        <EmptyListMessage>There are no public keys</EmptyListMessage>
      }
    </div>
  )
}

export default PublicKeysList
