import { ValueCard } from '../cards'
import { BigNumber, CreditsBlock, Identifier, InfoLine } from '../data'
import { TokenTransitionEnum } from '../../enums/tokenTransition'
import TokenTransitionBadge from './TokenTransitionBadge'
import { Code, Box, Text, Badge } from '@chakra-ui/react'
import { colors } from '../../styles/colors'
import './TokenTransitionCard.scss'

// Define which fields should be shown for each transition type
const fieldsOfTypes = {
  MINT: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'IssuedToIdentity',
    'PublicNote',
    'GroupInfo'
  ],
  TRANSFER: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'Recipient',
    'PublicNote',
    'SharedEncryptedNote',
    'PrivateEncryptedNote',
    'GroupInfo'
  ],
  BURN: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'BurnFromIdentity'
  ],
  FREEZE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'FreezeForIdentity'
  ],
  UNFREEZE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'UnfreezeForIdentity'
  ],
  DESTROY_FROZEN_FUNDS: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'DestroyFromIdentity'
  ],
  CLAIM: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'ClaimToIdentity'
  ],
  EMERGENCY_ACTION: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'EmergencyDetails'
  ],
  CONFIG_UPDATE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'ConfigChanges'
  ],
  DIRECT_PURCHASE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Amount',
    'Price',
    'Buyer',
    'Seller'
  ],
  SET_PRICE_FOR_DIRECT_PURCHASE: [
    'Action',
    'TokenId',
    'TokenContractPosition',
    'DataContractId',
    'IdentityContractNonce',
    'Price'
  ]
}

const TokenTransitionCard = ({ transition, owner, rate, className }) => {
  const transitionType = TokenTransitionEnum[transition?.tokenTransitionType]
  const fields = fieldsOfTypes[transitionType] || []

  console.log('TokenTransitionEnum', TokenTransitionEnum)
  console.log('transition', transition)
  console.log('transition?.tokenTransitionType', transition?.tokenTransitionType)
  console.log('TokenTransitionCard transitionType', transitionType)
  console.log('TokenTransitionCard fields', fields)

  return (
    <div className={`InfoBlock InfoBlock--Gradient TokenTransitionCard ${className || ''}`}>
       {/* Action Badge */}
       {fields.includes('Action') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Action'}
          title={'Action'}
          value={<TokenTransitionBadge typeId={transition?.tokenTransitionType}/>}
          error={transition?.tokenTransitionType === undefined}
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

      {/* Issued to Identity (for mints) */}
      {fields.includes('IssuedToIdentity') && transition?.issuedToIdentity && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--IssuedToIdentity'}
          title={'Issued to Identity ID'}
          value={(
            <ValueCard link={`/identity/${transition?.issuedToIdentity}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition?.issuedToIdentity}
              </Identifier>
            </ValueCard>
          )}
        />
      )}

      {/* Price (for purchases) */}
      {fields.includes('Price') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--Price'}
          title={'Price'}
          value={<CreditsBlock credits={transition?.price} rate={rate}/>}
          error={transition?.price === undefined}
        />
      )}

      {/* Public Note */}
      {fields.includes('PublicNote') && (
        <InfoLine
          className={'TokenTransitionCard__InfoLine TokenTransitionCard__InfoLine--PublicNote'}
          title={'Public Note'}
          value={transition?.publicNote}
          error={!transition?.publicNote}
        />
      )}

      {/* Group Info Section */}
      {fields.includes('GroupInfo') && transition?.groupInfo && (
        <Box>
          <Text fontSize='12px' color='#93AAB2' fontFamily='Roboto Mono' mt={4} mb={2}>
            Group Info:
          </Text>
          <Box bg='#2E393D' borderRadius='8px' p={3}>
            <Box display='flex' flexDirection='column' gap={3}>
              {/* Group Contract Position */}
              {transition?.groupInfo?.contractPosition !== undefined && (
                <InfoLine
                  title={'Group Contract Position'}
                  value={(
                    <Box bg='rgba(255, 255, 255, 0.1)' px={2} py={1} borderRadius='8px'>
                      <Text fontSize='12px' color='#FFFFFF' fontFamily='Roboto Mono'>
                        {transition?.groupInfo?.contractPosition}
                      </Text>
                    </Box>
                  )}
                />
              )}

              {/* Action ID */}
              {transition?.groupInfo?.actionId && (
                <InfoLine
                  title={'Action ID'}
                  value={(
                    <Box bg='rgba(255, 255, 255, 0.1)' px={2} py={1} borderRadius='8px'>
                      <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                        {transition?.groupInfo?.actionId}
                      </Identifier>
                    </Box>
                  )}
                />
              )}

              {/* Action Is Proposer */}
              {transition?.groupInfo?.isProposer !== undefined && (
                <InfoLine
                  title={'Action Is Proposer'}
                  value={(
                    <Box
                      bg={transition?.groupInfo?.isProposer ? 'rgba(91, 244, 88, 0.2)' : 'rgba(244, 91, 91, 0.2)'}
                      px={2}
                      py={1}
                      borderRadius='8px'
                    >
                      <Text
                        fontSize='11px'
                        color={transition?.groupInfo?.isProposer ? '#5BF458' : '#F45B5B'}
                        fontFamily='Roboto Mono'
                      >
                        {transition?.groupInfo?.isProposer ? 'Yes' : 'No'}
                      </Text>
                    </Box>
                  )}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Shared Encrypted Note Section */}
      {fields.includes('SharedEncryptedNote') && transition?.sharedEncryptedNote && (
        <Box>
          <Text fontSize='12px' color='#93AAB2' fontFamily='Roboto Mono' mt={4} mb={2}>
            Shared Encrypted Note:
          </Text>
          <Box bg='#2E393D' borderRadius='8px' p={3}>
            <Box display='flex' flexDirection='column' gap={3}>
              {/* Sender Key Index */}
              {transition?.sharedEncryptedNote?.senderKeyIndex && (
                <InfoLine
                  title={'Sender Key Index'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text fontSize='10px' color='#93AAB2' fontFamily='Roboto Mono'>
                        {transition?.sharedEncryptedNote?.senderKeyIndex}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Recipient Key Index */}
              {transition?.sharedEncryptedNote?.recipientKeyIndex && (
                <InfoLine
                  title={'Recipient Key Index'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text fontSize='10px' color='#93AAB2' fontFamily='Roboto Mono'>
                        {transition?.sharedEncryptedNote?.recipientKeyIndex}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Raw Data */}
              {transition?.sharedEncryptedNote?.rawData && (
                <InfoLine
                  title={'Raw data'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text
                        fontSize='10px'
                        color='#93AAB2'
                        fontFamily='Roboto Mono'
                        maxWidth='240px'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        whiteSpace='nowrap'
                      >
                        {transition?.sharedEncryptedNote?.rawData}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Private Encrypted Note Section */}
      {fields.includes('PrivateEncryptedNote') && transition?.privateEncryptedNote && (
        <Box>
          <Text fontSize='12px' color='#93AAB2' fontFamily='Roboto Mono' mt={4} mb={2}>
            Private Encrypted Note:
          </Text>
          <Box bg='#2E393D' borderRadius='8px' p={3}>
            <Box display='flex' flexDirection='column' gap={3}>
              {/* Root Encryption Key Index */}
              {transition?.privateEncryptedNote?.rootEncryptionKeyIndex && (
                <InfoLine
                  title={'Root Encryption Key Index'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text fontSize='10px' color='#93AAB2' fontFamily='Roboto Mono'>
                        {transition?.privateEncryptedNote?.rootEncryptionKeyIndex}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Derivation Encryption Key */}
              {transition?.privateEncryptedNote?.derivationEncryptionKey && (
                <InfoLine
                  title={'Derivation Encryption Key'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text fontSize='10px' color='#93AAB2' fontFamily='Roboto Mono'>
                        {transition?.privateEncryptedNote?.derivationEncryptionKey}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}

              {/* Raw Data */}
              {transition?.privateEncryptedNote?.rawData && (
                <InfoLine
                  title={'Raw data'}
                  value={(
                    <Box bg='#3A454A' px={2} py={1} borderRadius='3px' display='flex' alignItems='center' gap={2}>
                      <Text
                        fontSize='10px'
                        color='#93AAB2'
                        fontFamily='Roboto Mono'
                        maxWidth='240px'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        whiteSpace='nowrap'
                      >
                        {transition?.privateEncryptedNote?.rawData}
                      </Text>
                      <Box cursor='pointer'>
                        <Text fontSize='10px' color='#FFFFFF'>📋</Text>
                      </Box>
                    </Box>
                  )}
                />
              )}
            </Box>
          </Box>
        </Box>
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
