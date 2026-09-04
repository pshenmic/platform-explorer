import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { CopyButton } from '@components/ui/Buttons'
import type { AssetLockProofData, DecodedFeeStrategy, DecodedTxOutput } from '../../types'

interface AddressFundingFromAssetLockProps {
  assetLockProof?: AssetLockProofData | null
  userFeeIncrease?: number | null
  outputs?: DecodedTxOutput[]
  feeStrategy?: DecodedFeeStrategy[]
  signature?: string | null
}

export const AddressFundingFromAssetLock = ({
  assetLockProof,
  userFeeIncrease,
  outputs = [],
  feeStrategy = [],
  signature
}: AddressFundingFromAssetLockProps) => (
  <>
    <InfoLine
      className="TransactionPage__InfoLine TransactionPage__InfoLine--Inline"
      title="User Fee Increase"
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {assetLockProof && (
      <InfoLine
        align="top"
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Asset Lock Proof"
        value={
          <div className="TransactionPage__AssetLockGrid">
            <span>Type:</span>
            <ValueCard>{assetLockProof.type}</ValueCard>

            {assetLockProof.coreChainLockedHeight !== null && (
              <>
                <span>Core Chain Locked Height:</span>
                <ValueCard>{assetLockProof.coreChainLockedHeight}</ValueCard>
              </>
            )}
            <span>Funding Amount:</span>
            <ValueCard>{assetLockProof.fundingAmount} satoshis</ValueCard>
            <span>Output Index (vout):</span>
            <ValueCard>{assetLockProof.vout}</ValueCard>

            <span>Funding Core Transaction:</span>
            <ValueCard>
              <Identifier copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {assetLockProof.fundingCoreTx}
              </Identifier>
            </ValueCard>

            <span>Instant Lock:</span>
            <ValueCard className={'TransactionPage__RawTransaction'}>
              <div>
                {assetLockProof.instantLock}
                <CopyButton text={assetLockProof.instantLock ?? undefined} />
              </div>
            </ValueCard>
          </div>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align="top"
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth TransactionPage__InfoLine--Outputs'
        }
        title={`Outputs (${outputs.length})`}
        value={
          <div className="TransactionPage__Stack">
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__Row TransactionPage__Row--mdCol">
                  <ValueCard
                    className="TransactionPage__AddressCard"
                    link={`/platformAddress/${output.platformAddress.bech32m}`}
                  >
                    <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
                      {output.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>
                    <div>{output.credits} credits</div>
                  </ValueCard>
                </div>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Fee Strategy"
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <div key={index} className="TransactionPage__FeeRow">
                <ValueCard>{strategy.type}</ValueCard>
                <ValueCard>Value: {strategy.value}</ValueCard>
              </div>
            ))}
          </div>
        }
      />
    )}

    {signature && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Signature"
        value={
          <ValueCard>
            <div className="TransactionPage__SignatureRow">
              <span className="TransactionPage__SignatureText">{signature}</span>
              <CopyButton text={signature} />
            </div>
          </ValueCard>
        }
      />
    )}
  </>
)
