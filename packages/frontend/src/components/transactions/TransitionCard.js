import { ValueCard } from '../cards'
import { CreditsBlock, Identifier, InfoLine, PrefundedBalance } from '../data'
import { DocumentActionEnum } from '../../enums/documentAction'
import { DocumentActionBadge } from '../documents'
import { ValueContainer } from '../ui/containers'
import { Code } from '@chakra-ui/react'
import TokenTransitionCard from '../tokens/TokenTransitionCard'
import './TransitionCard.scss'

const fieldsOfTypes = {
  CREATE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'Revision',
    'IdentityContractNonce',
    'Data',
    'PrefundedVotingBalance'
  ],
  REPLACE: [
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
  DELETE: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'DocumentType',
    'IdentityContractNonce',
    'Data'
  ],
  TRANSFER: [
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
  PURCHASE: [
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
  UPDATE_PRICE: [
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

function TransitionCard ({ transition, owner, rate, className }) {
  if (transition?.transitionType === 'tokenTransition') {
    return (
      <TokenTransitionCard
        transition={transition}
        owner={owner}
        rate={rate}
        className={className}
      />
    )
  }

  const fields = fieldsOfTypes?.[DocumentActionEnum?.[transition?.action]]

  return (
    <div className={`InfoBlock InfoBlock--Gradient TransitionCard ${className || ''}`}>
      <InfoLine
        className={'TransitionCard__InfoLine TransitionCard__InfoLine--Action'}
        title={'Action'}
        value={<DocumentActionBadge typeId={transition?.action}/>}
        error={transition?.action === undefined}
      />

      {fields.indexOf('DataContractIdentifier') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--IdContainer'}
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

      {fields.indexOf('DocumentIdentifier') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--IdContainer'}
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

      {fields.indexOf('ReceiverIdentifier') !== -1 && // transfer
        transition?.receiverId &&
          <>
            {owner &&
              <InfoLine
                className={'TransitionCard__InfoLine TransitionCard__InfoLine--IdContainer'}
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
              className={'TransitionCard__InfoLine TransitionCard__InfoLine--IdContainer'}
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

      {fields.indexOf('SellerIdentifier') !== -1 && owner && // purchase
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--IdContainer'}
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

      {fields.indexOf('Price') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine'}
          title={'Price'}
          value={<CreditsBlock credits={transition?.price} rate={rate}/>}
          error={transition?.price === undefined}
        />
      }

      {fields.indexOf('DocumentType') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--DocumentType'}
          title={'Document Type'}
          value={(
            <ValueContainer>
              {transition?.type}
            </ValueContainer>
          )}
          error={!transition?.type}
        />
      }

      {fields.indexOf('Revision') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Revision'}
          title={'Revision'}
          value={transition?.revision}
          error={transition?.revision === undefined}
        />
      }

      {fields.indexOf('IdentityContractNonce') !== -1 &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Nonce'}
          title={'Identity Contract Nonce'}
          value={transition?.identityContractNonce}
          error={transition?.identityContractNonce === undefined}
        />
      }

      {fields.indexOf('Data') !== -1 && transition?.data &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Data'}
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
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--PrefundedBalance'}
          title={'Prefunded Voting Balance'}
          value={<PrefundedBalance prefundedBalance={transition?.prefundedVotingBalance} rate={rate}/>}
        />
      }
    </div>
  )
}

export default TransitionCard
