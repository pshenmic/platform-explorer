import { ValueCard } from '../cards'
import { CreditsBlock, Identifier, InfoLine, PrefundedBalance } from '../data'
import BatchTypeBadge from '../transactions/BatchTypeBadge'
import { ValueContainer } from '../ui/containers'
import { Code } from '@chakra-ui/react'
import './DocumentTransitionCard.scss'

const fieldsOfTypes = {
  DOCUMENT_CREATE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'Data',
    'PrefundedVotingBalance'
  ],
  DOCUMENT_REPLACE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_DELETE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'IdentityContractNonce',
    'Data'
  ],
  DOCUMENT_TRANSFER: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'SenderIdentifier',
    'ReceiverIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_PURCHASE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'BuyerIdentifier',
    'SellerIdentifier',
    'DocumentType',
    'Price',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ],
  DOCUMENT_UPDATE_PRICE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'SenderIdentifier',
    'ReceiverIdentifier',
    'DocumentType',
    'Price',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ]
}

const DocumentTransitionCard = ({ transition, owner, rate, className }) => {
  const fields = fieldsOfTypes?.[transition?.action] || []

  return (
    <div className={`InfoBlock InfoBlock--Gradient DocumentTransitionCard ${className || ''}`}>
      <InfoLine
        className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Action'}
        title={'Action'}
        value={<BatchTypeBadge batchType={transition?.action}/>}
        error={transition?.action === undefined}
      />

      {fields?.indexOf('DataContractIdentifier') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'}
          title={'Data Contract Identifier'}
          value={(
            <ValueCard link={`/dataContract/${transition.dataContractId}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition.dataContractId}
              </Identifier>
            </ValueCard>
          )}
          error={!transition.dataContractId}
        />
      }

      {fields?.indexOf('DocumentIdentifier') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'}
          title={'Document Identifier'}
          value={(
            <ValueCard link={`/document/${transition.id}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition.id}
              </Identifier>
            </ValueCard>
          )}
          error={!transition.id}
        />
      }

      {fields?.indexOf('ReceiverIdentifier') !== -1 &&
        transition?.receiverId &&
          <>
            {owner &&
              <InfoLine
                className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'}
                title={'Sender Identifier:'}
                value={(
                  <ValueCard link={`/identity/${owner}`}>
                    <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                      {owner}
                    </Identifier>
                  </ValueCard>
                )}
              />
            }

            <InfoLine
              className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'}
              title={'Receiver Identifier'}
              value={(
                <ValueCard link={`/identity/${transition?.receiverId}`}>
                  <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                    {transition?.receiverId}
                  </Identifier>
                </ValueCard>
              )}
            />
          </>
      }

      {fields?.indexOf('SellerIdentifier') !== -1 && owner &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--IdContainer'}
          title={'Buyer Identifier'}
          value={(
            <ValueCard link={`/identity/${owner}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {owner}
              </Identifier>
            </ValueCard>
          )}
        />
      }

      {fields?.indexOf('Price') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine'}
          title={'Price'}
          value={<CreditsBlock credits={transition?.price} rate={rate}/>}
          error={transition?.price === undefined}
        />
      }

      {fields?.indexOf('DocumentType') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--DocumentType'}
          title={'Document Type'}
          value={(
            <ValueContainer>
              {transition?.type}
            </ValueContainer>
          )}
          error={!transition?.type}
        />
      }

      {fields?.indexOf('Revision') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Revision'}
          title={'Revision'}
          value={transition?.revision}
          error={transition?.revision === undefined}
        />
      }

      {fields?.indexOf('IdentityContractNonce') !== -1 &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Nonce'}
          title={'Identity Contract Nonce'}
          value={transition?.identityContractNonce}
          error={transition?.identityContractNonce === undefined}
        />
      }

      {fields?.indexOf('Data') !== -1 && transition?.data &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--Data'}
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
          error={transition?.data === undefined}
        />
      }

      {transition?.prefundedVotingBalance &&
        <InfoLine
          className={'DocumentTransitionCard__InfoLine DocumentTransitionCard__InfoLine--PrefundedBalance'}
          title={'Prefunded Voting Balance'}
          value={<PrefundedBalance prefundedBalance={transition?.prefundedVotingBalance} rate={rate}/>}
        />
      }
    </div>
  )
}

export default DocumentTransitionCard
