import { Grid, GridItem } from '@chakra-ui/react'
import { ValueCard } from '../../components/cards'
import PublicKeyBoundCard from './PublicKeyBoundCard'
import { ValueContainer } from '../ui/containers'
import { CopyButton } from '../ui/Buttons'
import * as pkEnums from '../../enums/publicKey'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysListItem ({ publicKey, className }) {
  return (
    <div className={`PublicKeysListItem ${className || ''}`}>
      <Grid className={'PublicKeysListItem__Content'}>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Id'}>
          {publicKey?.keyId}
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column--PublicKeyHash'}>
          <ValueCard className={'PublicKeysListItem__PublicKeyHash'} size={'sm'} colorScheme={'transparent'}>
            {publicKey?.hash}
          </ValueCard>
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Type'}>
          <ValueContainer colorScheme={'gray'} size={'sm'}>
            {pkEnums.KeyTypeEnum?.[publicKey?.type]}
          </ValueContainer>
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Purpose'}>
          <ValueContainer colorScheme={'blue'} size={'sm'}>
            {pkEnums.KeyPurposeTitle?.[pkEnums.KeyPurposeEnum?.[publicKey?.purpose]]}
          </ValueContainer>
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--SecurityLevel'}>
          <ValueContainer colorScheme={'green'} size={'sm'}>
            {pkEnums.SecurityLevelTitle?.[pkEnums.SecurityLevelEnum?.[publicKey?.securityLevel]]}
          </ValueContainer>
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--ReadOnly'}>
          <ValueContainer colorScheme={publicKey?.readOnly ? 'green' : 'red'} size={'sm'}>
            {publicKey?.readOnly ? 'True' : 'False'}
          </ValueContainer>
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Data'}>
          {publicKey?.data &&
            <ValueCard className={'PublicKeysListItem__Data'} colorScheme={'transparent'}>
              {publicKey.data}
              <CopyButton text={publicKey?.data}/>
            </ValueCard>
          }

          {publicKey?.contractBounds &&
            <PublicKeyBoundCard
              className={'PublicKeysListItem__PublicKeyBounds'}
              publicKeyBounds={publicKey?.contractBounds}
            />
          }
        </GridItem>
      </Grid>
    </div>
  )
}

export default PublicKeysListItem
