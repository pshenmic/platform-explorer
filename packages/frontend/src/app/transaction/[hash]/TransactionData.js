import { StateTransitionEnum } from '../../../enums/state.transition.type'
import { ValueCard } from '../../../components/cards'
import { Identifier, InfoLine, CreditsBlock, VoteChoice } from '../../../components/data'
import { TransitionCard, PublicKeyCard } from '../../../components/transactions'

function TransactionData ({ data, type, loading, rate }) {
  if (data === null) return <></>

  if (type === StateTransitionEnum.MASTERNODE_VOTE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Pro TX Hash'}
        value={(
          <ValueCard>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.proTxHash}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.proTxHash}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.contractId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.contractId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.contractId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Voter Identity'}
        value={(
          <ValueCard link={`/identity/${data?.ownerId}`} className={'TransactionPage__BlockHash'}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.ownerId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.ownerId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Choice'}
        value={<VoteChoice choiceStr={data?.choice}/>}
        loading={loading}
        error={!data?.choice}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Document Type'}
        value={(
          <ValueCard className={'TransactionPage__DocumentType'}>
            {data?.documentTypeName}
          </ValueCard>
        )}
        loading={loading}
        error={!data?.documentTypeName}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Index Name'}
        value={(
          <ValueCard className={'TransactionPage__IndexName'}>
            {data?.indexName}
          </ValueCard>
        )}
        loading={loading}
        error={!data?.indexName}
      />
    </>)
  }

  if (type === StateTransitionEnum.DATA_CONTRACT_CREATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.dataContractId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.dataContractId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.dataContractId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Contract Owner'}
        value={(
          <ValueCard link={`/identity/${data?.ownerId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.ownerId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.ownerId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Nonce'}
        value={data?.identityNonce}
        loading={loading}
        error={data?.identityNonce === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.DOCUMENTS_BATCH) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Owner'}
        value={(
          <ValueCard link={`/identity/${data?.ownerId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.ownerId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.ownerId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transitions'}
        title={`Transitions ${data?.transitions !== undefined ? `(${data?.transitions?.length})` : ''}`}
        value={(<>
          {data?.transitions?.map((transition, i) => (
            <TransitionCard className={'TransactionPage__TransitionCard'} transition={transition} key={i}/>
          ))}
        </>)}
        loading={loading}
        error={data?.transitions === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.IDENTITY_CREATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Address'}
        value={(
          <ValueCard link={`/identity/${data?.identityId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.identityId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.identityId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
        title={`Public Keys ${data?.publicKeys !== undefined ? `(${data?.publicKeys?.length})` : ''}`}
        value={(<>
          {data?.publicKeys?.map((publicKey, i) => (
            <PublicKeyCard className={'TransactionPage__PublicKeyCard'} publicKey={publicKey} key={i}/>
          ))}
        </>)}
        loading={loading}
        error={data?.publicKeys === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.IDENTITY_TOP_UP) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Amount'}
        value={<CreditsBlock credits={data?.amount} rate={rate}/>}
        loading={loading}
        error={data?.amount === undefined}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity'}
        value={(
          <ValueCard link={`/identity/${data?.identityId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.identityId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.identityId}
      />
    </>)
  }

  if (type === StateTransitionEnum.DATA_CONTRACT_UPDATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.dataContractId}`}>
            <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.dataContractId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.dataContractId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Contract Owner'}
        value={(
          <ValueCard link={`/identity/${data?.ownerId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.ownerId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.ownerId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Version'}
        value={data?.version}
        loading={loading}
        error={data?.version === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.IDENTITY_UPDATE) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity'}
        value={(
          <ValueCard link={`/identity/${data?.identityId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.identityId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.identityId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Revision'}
        value={data?.revision}
        loading={loading}
        error={data?.revision === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
        title={`Add Public Keys ${data?.publicKeys !== undefined ? `(${data?.publicKeysToAdd?.length})` : ''}`}
        value={(<>
          {data?.publicKeysToAdd?.map((publicKey, i) => (
            <PublicKeyCard className={'TransactionPage__PublicKeyCard'} publicKey={publicKey} key={i}/>
          ))}
        </>)}
        loading={loading}
        error={data?.publicKeysToAdd === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.IDENTITY_CREDIT_WITHDRAWAL) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Amount'}
        value={<CreditsBlock credits={data?.amount} rate={rate}/>}
        loading={loading}
        error={data?.amount === undefined}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Identity Nonce'}
        value={data?.identityNonce}
        loading={loading}
        error={data?.identityNonce === undefined}
      />
    </>)
  }

  if (type === StateTransitionEnum.IDENTITY_CREDIT_TRANSFER) {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Sender'}
        value={(
          <ValueCard link={`/identity/${data?.senderId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.senderId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.senderId}
      />
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Recipient'}
        value={(
          <ValueCard link={`/identity/${data?.recipientId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.recipientId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={!data?.recipientId}
      />

      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Amount'}
        value={<CreditsBlock credits={data?.amount} rate={rate}/>}
        loading={loading}
        error={data?.amount === undefined}
      />
    </>)
  }
}

export default TransactionData
