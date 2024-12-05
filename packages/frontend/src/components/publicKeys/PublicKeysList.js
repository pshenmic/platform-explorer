import { Grid, GridItem } from '@chakra-ui/react'
import { ValueCard } from '../../components/cards'
import './PublicKeysList.scss'
import './PublicKeysListItem.scss'
import { ValueContainer } from '../ui/containers'

function PublicKeysList ({ publicKeys = [] }) {
  const boundTypeTitles = {
    documentType: 'Document Type'
  }

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
          <Grid className={'PublicKeysListItem__Content'}>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Id'}>{publicKey?.id}</GridItem>
            <GridItem className={'PublicKeysListItem__Column--PublicKeyHash'}>
              <ValueCard className={'PublicKeysListItem__PublicKeyHash'}>{publicKey?.publicKeyHash}</ValueCard>
            </GridItem>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Type'}>
              <ValueContainer colorScheme={'gray'}>
                {publicKey?.type}
              </ValueContainer>
            </GridItem>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Purpose'}>
              <ValueContainer colorScheme={'blue'}>
                {publicKey?.purpose}
              </ValueContainer>
            </GridItem>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--SecurityLevel'}>
              <ValueContainer colorScheme={'green'}>
                {publicKey?.securityLevel}
              </ValueContainer>
            </GridItem>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--ReadOnly'}>
              <ValueContainer colorScheme={!publicKey?.readOnly ? 'green' : 'red'}>
                {publicKey?.readOnly ? 'True' : 'False'}
              </ValueContainer>
            </GridItem>
            <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Data'}>
              <ValueCard className={'PublicKeysListItem__Data'}>{publicKey?.data}</ValueCard>

              {publicKey?.contractBounds &&
                <div className={''}>
                  <div>Bound to</div>
                  <div>{publicKey?.contractBounds?.id}</div>
                  {boundTypeTitles[publicKey?.contractBounds?.type] || publicKey?.contractBounds?.type}: {publicKey?.contractBounds?.typeName}
                </div>
              }
            </GridItem>
          </Grid>
        </div>
      ))}
    </div>
  )
}

export default PublicKeysList
