import { Grid, GridItem } from '@chakra-ui/react'
import type { ComponentType, ReactNode } from 'react'
import { ValueCard as ValueCardJs } from '../../components/cards'
import PublicKeyBoundCard from './PublicKeyBoundCard'
import type { PublicKeyBounds } from './PublicKeyBoundCard'
import { ValueContainer } from '../ui/containers'
import { CopyButton } from '../ui/Buttons'
import * as pkEnums from '../../enums/publicKey'
import { NotActive as NotActiveJs } from '../data'
import './PublicKeysListItem.css'
import './PublicKeyBoundCard.css'
import { Tooltip } from '../ui/Tooltips'
import { formatDate } from '../../util'
import type { WithClassName } from '../../types/common'

const ValueCard = ValueCardJs as ComponentType<{
  children?: ReactNode
  className?: string
  colorScheme?: string
  size?: string
}>

const NotActive = NotActiveJs as ComponentType<{
  children?: ReactNode
  className?: string
}>

export interface PublicKey {
  keyId?: number | string
  publicKeyHash?: string
  keyType?: string | number
  purpose?: string | number
  securityLevel?: string | number
  disabledAt?: string | number | null
  readOnly?: boolean
  data?: string
  contractBounds?: PublicKeyBounds | null
}

interface PublicKeysListItemProps extends WithClassName {
  publicKey?: PublicKey | null
}

function PublicKeysListItem ({ publicKey, className }: PublicKeysListItemProps) {
  const securityLevelKey = publicKey?.securityLevel as keyof typeof pkEnums.SecurityLevelInfo | undefined
  const purposeKey = publicKey?.purpose as keyof typeof pkEnums.KeyPurposeInfo | undefined
  const securityLevel = securityLevelKey != null ? pkEnums.SecurityLevelInfo[securityLevelKey] : undefined
  const purpose = purposeKey != null ? pkEnums.KeyPurposeInfo[purposeKey] : undefined

  return (
    <div className={`PublicKeysListItem ${className || ''}`}>
      <Grid className={'PublicKeysListItem__Content'}>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Id'}>
          {publicKey?.keyId !== undefined ? publicKey?.keyId : <NotActive>-</NotActive>}
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column--PublicKeyHash'}>
          {publicKey?.publicKeyHash !== undefined
            ? <ValueCard className={'PublicKeysListItem__PublicKeyHash'} size={'sm'} colorScheme={'transparent'}>
                {publicKey.publicKeyHash}
                <CopyButton text={publicKey.publicKeyHash}/>
              </ValueCard>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Type'}>
          {publicKey?.keyType !== undefined
            ? <ValueContainer colorScheme={'gray'} size={'sm'}>
                {publicKey?.keyType || '-'}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Purpose'}>
          {purpose?.title !== undefined
            ? <ValueContainer colorScheme={purpose?.colorScheme as 'blue' | 'green' | 'orange' | 'gray' | 'red'} size={'sm'}>
                {purpose?.title}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--SecurityLevel'}>
          {securityLevel?.title !== undefined
            ? <ValueContainer colorScheme={securityLevel?.colorScheme as 'blue' | 'green' | 'orange' | 'gray' | 'red'} size={'sm'}>
                {securityLevel?.title}
              </ValueContainer>
            : <NotActive/>
          }
        </GridItem>
        <GridItem className={'PublicKeysListItem__Column PublicKeysListItem__Column--Disabled'}>
          {publicKey?.disabledAt
            ? <Tooltip placement={'top'} title={'Disabled at'} content={formatDate(publicKey.disabledAt)?.formatted}>
                <span>
                  <ValueContainer colorScheme={publicKey?.disabledAt ? 'red' : 'green'} size={'sm'}>
                    True
                  </ValueContainer>
                </span>
              </Tooltip>
            : <ValueContainer colorScheme={publicKey?.disabledAt ? 'red' : 'green'} size={'sm'}>
                 False
              </ValueContainer>
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
