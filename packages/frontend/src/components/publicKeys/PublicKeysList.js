import { Grid, GridItem } from '@chakra-ui/react'
import './PublicKeysList.scss'
import './PublicKeysListItem.scss'

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

      {publicKeys.map((publicKey, i) => (
        <div className={'PublicKeysList__ListItem PublicKeysListItem'} key={i}>
          <div className={'PublicKeysListItem'}>

            <div className={'PublicKeysListItem__Column'}>{publicKey?.id}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.publicKeyHash}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.type}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.purpose}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.securityLevel}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.readOnly}</div>
            <div className={'PublicKeysListItem__Column'}>{publicKey?.data}</div>

          </div>
        </div>
      ))}
    </div>
  )
}

export default PublicKeysList
