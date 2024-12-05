import { Grid, GridItem } from '@chakra-ui/react'
import PublicKeysListItem from './PublicKeysListItem'
import './PublicKeysList.scss'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysList ({ publicKeys = [] }) {
  return (
    <div className={'PublicKeysList'}>
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

      {publicKeys.map((publicKey, i) => <PublicKeysListItem publicKey={publicKey} key={i}/>)}
    </div>
  )
}

export default PublicKeysList
