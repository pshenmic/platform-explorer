import { ValueCard } from '../../../components/cards'
import { Identifier, InfoLine, CreditsBlock, VoteChoice, CodeBlock } from '../../../components/data'
import { TransitionCard, PublicKeyCard, VoteIndexValues } from '../../../components/transactions'
import { ValueContainer } from '../../../components/ui/containers'
import { networks } from '../../../constants/networks'
import { CopyButton } from '../../../components/ui/Buttons'
import { InternalConfigCard } from '../../../components/dataContracts'

function AssetLockProof ({ assetLockProof = {}, loading }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const activeNetwork = networks.find(network => network.explorerBaseUrl === baseUrl)
  const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

  return (<>
    {assetLockProof?.instantLock &&
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Asset Lock Proof'}
        value={(
          <ValueCard className={'TransactionPage__AssetLockProof'}>
            {assetLockProof?.instantLock}
            <CopyButton text={assetLockProof?.instantLock}/>
          </ValueCard>
        )}
        loading={loading}
        error={!assetLockProof?.instantLock}
      />
    }

    {assetLockProof?.fundingCoreTx &&
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Core Transaction Hash'}
        value={(
          <a
            href={l1explorerBaseUrl
              ? `${l1explorerBaseUrl}/tx/${assetLockProof?.fundingCoreTx}`
              : '#'}
            target={'_blank'}
            rel={'noopener noreferrer'}
          >
            <ValueContainer elipsed={true} clickable={true} external={true}>
              <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {assetLockProof?.fundingCoreTx}
              </Identifier>
            </ValueContainer>
          </a>
        )}
        loading={loading}
        error={!assetLockProof?.fundingCoreTx}
      />
    }
  </>)
}

function TransactionData ({ data, type, loading, rate }) {
  const poolingColors = {
    Standard: 'green',
    Never: 'red',
    'If Available': 'orange'
  }

  if (data === null) return <></>

  if (type === 'MASTERNODE_VOTE') {
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
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={data?.nonce}
        loading={loading}
        error={data?.nonce === undefined}
      />

      <InfoLine
        className={`TransactionPage__InfoLine TransactionPage__InfoLine--VoteChoice ${!data?.choice?.includes('TowardsIdentity') ? 'TransactionPage__InfoLine--Inline' : ''}`}
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

      {data?.indexValues &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--VoteIndexValues TransactionPage__InfoLine--Baseline'}
          title={'Index Values'}
          value={(
            <div className={'TransactionPage__VoteIndexValuesContainer'}>
              <VoteIndexValues indexValues={data?.indexValues}/>
            </div>
          )}
          loading={loading}
          error={!data?.indexValues}
        />
      }
    </>)
  }

  if (type === 'DATA_CONTRACT_CREATE') {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Data Contract'}
        value={(
          <ValueCard link={`/dataContract/${data?.dataContractId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
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
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Version'}
        value={data?.version}
        loading={loading}
        error={data?.version === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={data?.identityNonce}
        loading={loading}
        error={data?.identityNonce === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Signature Public Key Id'}
        value={data?.signaturePublicKeyId}
        loading={loading}
        error={data?.signaturePublicKeyId === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Schema'}
        title={'Schema'}
        value={<CodeBlock code={JSON.stringify(data?.schema)}/>}
        loading={loading}
        error={data?.schema === undefined}
      />

      {data?.internalConfig &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'}
          title={'Internal Config'}
          value={<InternalConfigCard config={data?.internalConfig}/>}
          loading={loading}
          error={data?.schema === undefined}
        />
      }
    </>)
  }

  if (type === 'BATCH') {
    return (<>
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transitions'}
        title={`Transitions ${data?.transitions !== undefined ? `(${data?.transitions?.length})` : ''}`}
        value={(<>
          {data?.transitions?.map((transition, i) => (
            <TransitionCard
              className={'TransactionPage__TransitionCard'}
              transition={transition}
              owner={data?.ownerId}
              rate={rate}
              key={i}/>
          ))}
        </>)}
        loading={loading}
        error={data?.transitions === undefined}
      />
    </>)
  }

  if (type === 'IDENTITY_CREATE') {
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

      <AssetLockProof
        assetLockProof={data?.assetLockProof}
        rate={rate}
        loading={loading}
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

  if (type === 'IDENTITY_TOP_UP') {
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

      {data?.assetLockProof &&
        <AssetLockProof
          assetLockProof={data?.assetLockProof}
          rate={rate}
          loading={loading}
        />
      }
    </>)
  }

  if (type === 'DATA_CONTRACT_UPDATE') {
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

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Contract Nonce'}
        value={data?.identityContractNonce}
        loading={loading}
        error={data?.identityContractNonce === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Schema'}
        title={'Schema'}
        value={<CodeBlock code={JSON.stringify(data?.schema)}/>}
        loading={loading}
        error={data?.schema === undefined}
      />

      {data?.internalConfig &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--InternalConfig TransactionPage__InfoLine--Baseline'}
          title={'Internal Config'}
          value={<InternalConfigCard config={data?.internalConfig}/>}
          loading={loading}
          error={data?.schema === undefined}
        />
      }

    </>)
  }

  if (type === 'IDENTITY_UPDATE') {
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

      {data?.identityContractNonce !== undefined &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
          title={'Identity Nonce'}
          value={data?.identityNonce}
          loading={loading}
          error={data?.identityNonce === undefined}
        />
      }

      {data?.publicKeysToAdd?.length > 0 &&
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
      }

      {data?.setPublicKeyIdsToDisable?.length > 0 &&
        <InfoLine
          className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
          title={`Disable Public Keys ${data?.setPublicKeyIdsToDisable !== undefined ? `(${data?.setPublicKeyIdsToDisable?.length})` : ''}`}
          value={(<>
            {data?.setPublicKeyIdsToDisable?.map((publicKey, i) => (
              <PublicKeyCard className={'TransactionPage__PublicKeyCard'} publicKey={{ id: publicKey }} key={i}/>
            ))}
          </>)}
          loading={loading}
          error={data?.setPublicKeyIdsToDisable === undefined}
        />
      }
    </>)
  }

  if (type === 'IDENTITY_CREDIT_WITHDRAWAL') {
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
          <ValueCard link={`/identity/${data?.senderId}`}>
            <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
              {data?.senderId}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={data?.amount === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={data?.nonce}
        loading={loading}
        error={data?.nonce === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Signature Public Key Id'}
        value={data?.signaturePublicKeyId}
        loading={loading}
        error={data?.signaturePublicKeyId === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Pooling'}
        title={'Pooling'}
        value={(
          <ValueContainer colorScheme={poolingColors?.[data?.pooling]} size={'sm'}>
            {data?.pooling}
          </ValueContainer>
        )}
        loading={loading}
        error={data?.pooling === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--OutputScript'}
        title={'Output Script'}
        value={(
          <ValueCard className={'TransactionPage__OutputScript'}>
            <Identifier copyButton={true} ellipsis={false}>
              {data?.outputScript}
            </Identifier>
          </ValueCard>
        )}
        loading={loading}
        error={data?.outputScript === undefined}
      />
    </>)
  }

  if (type === 'IDENTITY_CREDIT_TRANSFER') {
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

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Identity Nonce'}
        value={data?.identityNonce}
        loading={loading}
        error={data?.identityNonce === undefined}
      />

      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
        title={'Signature Public Key Id'}
        value={data?.signaturePublicKeyId}
        loading={loading}
        error={data?.signaturePublicKeyId === undefined}
      />
    </>)
  }
}

export default TransactionData
