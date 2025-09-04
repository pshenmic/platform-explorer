import { Grid, GridItem } from '@chakra-ui/react'
import { ValueCard } from '../../components/cards'
import PublicKeyBoundCard from './PublicKeyBoundCard'
import { ValueContainer } from '../ui/containers'
import { CopyButton } from '../ui/Buttons'
import * as pkEnums from '../../enums/publicKey'
import { NotActive } from '../data'
import './PublicKeysListItem.scss'
import './PublicKeyBoundCard.scss'

function PublicKeysListItem ({ publicKey, className }) {
  const securityLevel = pkEnums.SecurityLevelInfo?.[publicKey?.securityLevel]
  const purpose = pkEnums.KeyPurposeInfo?.[publicKey?.purpose]
  return (
    <div className={`PublicKeysListItem ${className || ''}`}>
      <Grid className={'PublicKeysListItem__Content'}>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Id'}>
          {publicKey?.keyId !== undefined ? publicKey?.keyId : <NotActive>-</NotActive>}
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column--PublicKeyHash'}>
          {publicKey?.raw !== undefined
            ? <ValueCard className={'PublicKeysListItem__PublicKeyHash'} size={'sm'} colorScheme={'transparent'}>
                {publicKey.raw}
                <CopyButton text={publicKey.raw}/>
              </ValueCard>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Type'}>
          {publicKey?.type !== undefined
            ? <ValueContainer colorScheme={'gray'} size={'sm'}>
                {publicKey?.type || '-'}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Purpose'}>
          {purpose?.title !== undefined
            ? <ValueContainer colorScheme={purpose?.colorScheme} size={'sm'}>
                {purpose?.title}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--SecurityLevel'}>
          {securityLevel?.title !== undefined
            ? <ValueContainer colorScheme={securityLevel?.colorScheme} size={'sm'}>
                {securityLevel?.title}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--ReadOnly'}>
          {publicKey?.readOnly !== undefined
            ? <ValueContainer colorScheme={publicKey?.readOnly ? 'red' : 'green'} size={'sm'}>
                {publicKey?.readOnly ? 'True' : 'False'}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Data'}>
          {publicKey?.data !== undefined
            ? <ValueCard className={'PublicKeysListItem__Data'} colorScheme={'transparent'}>
                {publicKey?.data}
                <CopyButton text={publicKey?.data}/>
              </ValueCard>
            : <NotActive/>
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
