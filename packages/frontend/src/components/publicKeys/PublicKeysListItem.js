import { Grid, GridItem } from '@chakra-ui/react'
import { ValueCard } from '../../components/cards'
import PublicKeyBoundCard from './PublicKeyBoundCard'
import { ValueContainer } from '../ui/containers'
import { CopyButton } from '../ui/Buttons'
import * as pkEnums from '../../enums/publicKey'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysListItem ({ publicKey, className }) {
  const securityLevel = pkEnums.SecurityLevelInfo?.[pkEnums.SecurityLevelEnum?.[publicKey?.securityLevel]]
  const purpose = pkEnums.KeyPurposeInfo?.[pkEnums.KeyPurposeEnum?.[publicKey?.purpose]]

  return (
    <div className={`PublicKeysListItem ${className || ''}`}>
      <Grid className={'PublicKeysListItem__Content'}>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Id'}>
          {publicKey?.keyId !== undefined ? publicKey?.keyId : '-'}
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column--PublicKeyHash'}>
          {publicKey?.hash !== undefined
            ? <ValueCard className={'PublicKeysListItem__PublicKeyHash'} size={'sm'} colorScheme={'transparent'}>
                {publicKey?.hash}
                <CopyButton text={publicKey?.hash}/>
            </ValueCard>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Type'}>
          {publicKey?.type !== undefined
            ? <ValueContainer colorScheme={'gray'} size={'sm'}>
                {pkEnums.KeyTypeEnum?.[publicKey?.type] || '-'}
              </ValueContainer>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Purpose'}>
          {purpose?.title !== undefined
            ? <ValueContainer colorScheme={purpose?.colorScheme} size={'sm'}>
              {purpose?.title}
            </ValueContainer>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--SecurityLevel'}>
          {securityLevel?.title !== undefined
            ? <ValueContainer colorScheme={securityLevel?.colorScheme} size={'sm'}>
                {securityLevel?.title}
              </ValueContainer>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--ReadOnly'}>
          {publicKey?.readOnly !== undefined
            ? <ValueContainer colorScheme={publicKey?.readOnly ? 'green' : 'red'} size={'sm'}>
                {publicKey?.readOnly ? 'True' : 'False'}
              </ValueContainer>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Data'}>
          {publicKey?.data !== undefined
            ? <ValueCard className={'PublicKeysListItem__Data'} colorScheme={'transparent'}>
                {publicKey?.data}
                <CopyButton text={publicKey?.data}/>
              </ValueCard>
            : <span className={'PublicKeysListItem__NotActiveText'}>n/a</span>
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
