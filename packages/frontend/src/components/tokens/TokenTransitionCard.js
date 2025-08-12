import { ValueCard } from '../cards'
import { BigNumber, CreditsBlock, Identifier, InfoLine } from '../data'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import TokenEmergencyActionBadge from './TokenEmergencyActionBadge'
import { PriceList } from './prices'
import { Code, Badge, Flex } from '@chakra-ui/react'
import { colors } from '../../styles/colors'
import { getMinTokenPrice } from '../../util'
import './TokenTransitionCard.scss'

const fieldsOfTypes = {
  TOKEN_MINT: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'IssuedToIdentity',
    'PublicNote'
    // 'GroupInfo'
  ],
  TOKEN_TRANSFER: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Recipient',
    'PublicNote'
    // 'SharedEncryptedNote',
    // 'PrivateEncryptedNote',
    // 'GroupInfo'
  ],
  TOKEN_BURN: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
    // 'BurnFromIdentity'
  ],
  TOKEN_FREEZE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_UNFREEZE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_DESTROY_FROZEN_FUNDS: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'FrozenIdentityId'
  ],
  TOKEN_CLAIM: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Recipient'
  ],
  TOKEN_EMERGENCY_ACTION: [
    'Action',
    'EmergencyAction',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
  ],
  TOKEN_CONFIG_UPDATE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce'
    // 'ConfigChanges'
  ],
  TOKEN_DIRECT_PURCHASE: [
    'Action',
    'Amount',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Price'
    // 'Buyer',
    // 'Seller'
  ],
  TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Price'
  ]
}

const TokenTransitionCard = ({ transition, rate, className }) => {
  const fields = fieldsOfTypes[transition?.action] || []

  return (
    <div className={`InfoBlock InfoBlock--Gradient TokenTransitionCard ${className || ''}`}>
       {/* Action Badge */}
       {fields.includes('Action') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Action'}
          title={'Action'}
          value={
            <BatchTypeBadge
              batchType={transition?.action !== undefined ? transition?.action : undefined}
            />
          }
          error={transition?.action === undefined}
        />
       )}

      {/* Action Badge */}
      {fields.includes('EmergencyAction') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--EmergencyAction'}
          title={'Emergency Action'}
          value={<TokenEmergencyActionBadge type={transition?.emergencyAction}/>}
          error={transition?.emergencyAction === undefined}
        />
      )}

      {/* Amount */}
      {fields.includes('Amount') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Amount'}
          title={'Amount'}
          value={
            <Badge
              bg={`rgba(${colors.green['emeralds-rgb']}, .2)`}
              px={3}
              py={2}
              borderRadius={'0.5rem'}
              display={'flex'}
              alignItems={'baseline'}
              gap={2}
              maxWidth={'max-content'}
              color={`${colors.green.emeralds}`}
            >
              <BigNumber>
                {transition?.amount || '0'}
              </BigNumber>
              <span>
                {transition?.tokenSymbol || 'TOKEN'}
              </span>
            </Badge>
          }
          error={transition?.amount === undefined}
        />
      )}

      {/* Token ID */}
      {fields.includes('TokenId') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--TokenId'}
          title={'Token ID'}
          value={(
            <ValueCard>
              <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.tokenId}
              </Identifier>
            </ValueCard>
          )}
          error={!transition?.tokenId}
        />
      )}

      {/* Recipient (for transfers) */}
      {fields.includes('Recipient') && transition?.recipient && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Recipient'}
          title={'Recipient'}
          value={(
            <ValueCard link={`/identity/${transition?.recipient}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.recipient}
              </Identifier>
            </ValueCard>
          )}
        />
      )}

      {/* Issued to Identity (for mints) */}
      {fields.includes('IssuedToIdentity') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--IssuedToIdentity'}
          title={'Issued to Identity ID'}
          value={(
            <ValueCard link={`/identity/${transition?.issuedToIdentityId}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.issuedToIdentityId}
              </Identifier>
            </ValueCard>
          )}
          error={!transition?.issuedToIdentityId}
        />
      )}

      {/* Identity Contract Nonce */}
      {fields.includes('IdentityContractNonce') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Nonce'}
          title={'Identity Contract Nonce'}
          value={transition?.identityContractNonce}
          error={transition?.identityContractNonce === undefined}
        />
      )}

      {/* Token Contract Position */}
      {fields.includes('TokenContractPosition') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--TokenContractPosition'}
          title={'Token Contract Position'}
          value={transition?.tokenContractPosition}
          error={transition?.tokenContractPosition === undefined || transition?.tokenContractPosition === null}
        />
      )}

      {/* Data Contract ID */}
      {fields.includes('DataContractId') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--DataContractId'}
          title={'Data Contract ID'}
          value={(
            <ValueCard link={`/dataContract/${transition?.dataContractId}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.dataContractId}
              </Identifier>
            </ValueCard>
          )}
          error={!transition?.dataContractId}
        />
      )}

      {/* Price (for purchases) */}
      {fields.includes('Price') && (<>
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Price'}
          title={'Price'}
          value={
            transition?.price != null
              ? <CreditsBlock credits={transition?.price} rate={rate}/>
              : transition?.prices != null && transition?.prices?.length > 0
                ? <Flex gap={'0.25rem'}>From <BigNumber>{getMinTokenPrice(transition?.prices)}</BigNumber> Credits</Flex>
                : 'none'
          }
          error={transition?.price === undefined && (!transition?.prices || transition?.prices?.length === 0)}
        />
        {transition?.prices != null && transition?.prices?.length > 0 &&
          <div className={'TokenTransitionCard__PriceList'}>
            <PriceList
              prices={transition?.prices}
              rate={rate}
            />
          </div>
        }
      </>)}

      {/* Public Note */}
      {fields.includes('PublicNote') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--PublicNote'}
          title={'Public Note'}
          value={transition?.publicNote}
          error={!transition?.publicNote}
        />
      )}

      {/* Raw Data (for transitions that have direct data) */}
      {transition?.data && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Data'}
          title={'Data'}
          value={(
            <Code
              borderRadius={'lg'}
              px={5}
              py={4}
            >
              {JSON.stringify(transition?.data, null, 2)}
            </Code>
          )}
        />
      )}
    </div>
  )
}

export default TokenTransitionCard
