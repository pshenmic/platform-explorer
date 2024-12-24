import { Grid, GridItem } from '@chakra-ui/react'
import PublicKeysListItem from './PublicKeysListItem'
import { EmptyListMessage } from '../ui/lists'
import './PublicKeysList.scss'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysList ({ publicKeys = [], className }) {
  return (
    <div className={`PublicKeysList ${className || ''}`}>
      <div className={'PublicKeysList__ScrollZone'}>
        <Grid className={'PublicKeysList__ColumnTitles'}>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Id'}>
            Key Id
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--PublicKeyHash'}>
            Public Key Hash
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
            Type
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Purpose'}>
            Purpose
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--SecurityLevel'}>
            Security Level
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--ReadOnly'}>
            Read Only
          </GridItem>
          <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Data'}>
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
    </div>
  )
}

export default PublicKeysList
