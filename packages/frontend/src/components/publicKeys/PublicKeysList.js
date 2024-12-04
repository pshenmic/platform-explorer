import { Grid, GridItem } from '@chakra-ui/react'

function PublicKeysList ({ publicKeys = [] }) {

  return (
    <div className={'PublicKeysList'}>
      <Grid className={'PublicKeysList__ColumnTitles'}>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Timestamp'}>
          Time
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Hash'}>
          Hash
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--GasUsed'}>
          Gas used
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Owner'}>
          Owner
        </GridItem>
        <GridItem className={'PublicKeysList__ColumnTitle PublicKeysList__ColumnTitle--Type'}>
          Type
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
