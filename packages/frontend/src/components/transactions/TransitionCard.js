import { ValueCard } from '../cards'
import { Identifier, InfoLine, PrefundedBalance } from '../data'
import { DocumentActionEnum } from '../../enums/documentAction'
import DocumentActionBadge from './DocumentActionBadge'
import { ValueContainer } from '../ui/containers'
import { Code } from '@chakra-ui/react'
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
    'Data'// 'LastRevisionData'
  ],
  TRANSFER: [
    'DataContractIdentifier',
    'DocumentIdentifier',
    'SenderIdentifier',
    'ReceiverIdentifier',
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
    'Price',
    'Revision',
    'IdentityContractNonce',
    'LastTimeCreated',
    'LastTimeUpdated',
    'LastTimeTransferred',
    'Data'
  ]
}

function TransitionCard ({ transition, rate, className }) {
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
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--DataContract'}
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
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--DataContract'}
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
          value={transition?.nonce}
          error={transition?.nonce === undefined}
        />
      }

      {fields.indexOf('Data') !== -1 &&
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

      {transition?.prefundedBalance &&
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--PrefundedBalance'}
          title={'Prefunded Voting Balance'}
          value={<PrefundedBalance prefundedBalance={transition?.prefundedBalance} rate={rate}/>}
        />
      }
    </div>
  )
}

export default TransitionCard
