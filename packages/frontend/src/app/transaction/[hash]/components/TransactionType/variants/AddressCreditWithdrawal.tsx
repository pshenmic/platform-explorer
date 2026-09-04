import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import type { DecodedFeeStrategy, DecodedInputWitness, DecodedTxInput } from '../../types'

interface AddressCreditWithdrawalProps {
  userFeeIncrease?: number | null
  inputs?: DecodedTxInput[]
  inputWitness?: DecodedInputWitness[]
  output?: unknown
  feeStrategy?: DecodedFeeStrategy[]
  pooling?: number | string | null
  outputAddress?: string | null
  outputScript?: string | null
  raw?: string | null
}

export const AddressCreditWithdrawal = ({
  userFeeIncrease,
  inputs = [],
  inputWitness = [],
  output,
  feeStrategy = [],
  pooling,
  outputAddress,
  outputScript,
  raw
}: AddressCreditWithdrawalProps) => (
  <>
    <InfoLine
      className="TransactionPage__InfoLine TransactionPage__InfoLine--Inline"
      title="User Fee Increase"
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {inputs && inputs.length > 0 && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title={`Inputs (${inputs.length})`}
        value={
          <div>
            {inputs.map((input, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__Row TransactionPage__Row--lgCol">
                  <ValueCard link={`/platformAddress/${input.platformAddress.bech32m}`}>
                    <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
                      {input.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>
                    <div>{input.credits} credits</div>
                  </ValueCard>
                  <ValueCard>Nonce: {input.nonce}</ValueCard>
                </div>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {inputWitness && inputWitness.length > 0 && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title={`Input Witness (${inputWitness.length})`}
        align="top"
        value={
          <div>
            {inputWitness.map((witness, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__WitnessGrid">
                  <span>Type:</span>
                  <div className="TransactionPage__Fit">
                    <ValueCard>{witness.type}</ValueCard>
                  </div>

                  <span>Signature:</span>
                  <ValueCard>
                    <Identifier copyButton ellipsis styles={['highlight-both']}>
                      {witness.value?.signature}
                    </Identifier>
                  </ValueCard>
                </div>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
      title={'Output'}
      value={<ValueCard>{output === null ? 'No output (null)' : JSON.stringify(output)}</ValueCard>}
    />

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title={'Fee Strategy'}
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

    <InfoLine
      className="TransactionPage__InfoLine TransactionPage__InfoLine--Inline"
      title="Pooling"
      value={pooling}
      error={pooling === undefined}
    />

    {outputAddress && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Output Address"
        value={
          <ValueCard>
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {outputAddress}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    {outputScript && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Output Script"
        value={
          <ValueCard className="TransactionPage__RawTransaction">
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {outputScript}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    {raw && (
      <InfoLine
        className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
        title="Raw Transaction"
        value={
          <div className="TransactionPage__RawWrap">
            <ValueCard className="TransactionPage__RawTransaction">
              <Identifier copyButton ellipsis styles={['highlight-both']}>
                {raw}
              </Identifier>
            </ValueCard>
          </div>
        }
      />
    )}
  </>
)
