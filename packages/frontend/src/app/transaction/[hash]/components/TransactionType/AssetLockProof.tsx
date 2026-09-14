import { CopyButton } from 'src/components/ui/Buttons'
import { InfoLine, Identifier } from '@components/data'
import { ValueCard } from '@components/cards'
import { ValueContainer } from '@components/ui/containers'
import { useActiveNetwork } from 'src/contexts'
import type { AssetLockProofData, WithLoading } from '../types'

interface AssetLockProofProps extends WithLoading {
  assetLockProof?: AssetLockProofData | null
  rate?: unknown
}

export const AssetLockProof = ({ assetLockProof, loading }: AssetLockProofProps) => {
  const { l1explorerBaseUrl } = useActiveNetwork()

  if (!assetLockProof) return null

  const { fundingCoreTx, instantLock, type, fundingAmount, vout, coreChainLockedHeight } =
    assetLockProof

  return (
    <>
      {type !== undefined && type !== null && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Asset Lock Type'}
          value={<ValueCard>{type}</ValueCard>}
          loading={loading}
        />
      )}

      {coreChainLockedHeight !== undefined && coreChainLockedHeight !== null && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Core Chain Locked Height'}
          value={<ValueCard>{coreChainLockedHeight}</ValueCard>}
          loading={loading}
        />
      )}

      {fundingAmount !== undefined && fundingAmount !== null && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Funding Amount'}
          value={<ValueCard>{fundingAmount} satoshis</ValueCard>}
          loading={loading}
        />
      )}

      {vout !== undefined && vout !== null && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Output Index (vout)'}
          value={<ValueCard>{vout}</ValueCard>}
          loading={loading}
        />
      )}

      {instantLock && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Asset Lock Proof'}
          value={
            <ValueCard className={'TransactionPage__AssetLockProof'}>
              {instantLock}
              <CopyButton text={instantLock} />
            </ValueCard>
          }
          loading={loading}
          error={!instantLock}
        />
      )}

      {fundingCoreTx && (
        <InfoLine
          className={'TransactionPage__InfoLine'}
          title={'Core Transaction Hash'}
          value={
            <a
              href={l1explorerBaseUrl ? `${l1explorerBaseUrl}/tx/${fundingCoreTx}` : '#'}
              target={'_blank'}
              rel={'noopener noreferrer'}
            >
              <ValueContainer elipsed={true} clickable={true} external={true}>
                <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                  {fundingCoreTx}
                </Identifier>
              </ValueContainer>
            </a>
          }
          loading={loading}
          error={!fundingCoreTx}
        />
      )}
    </>
  )
}
