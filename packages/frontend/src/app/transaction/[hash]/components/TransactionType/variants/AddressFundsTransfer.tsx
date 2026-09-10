import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import type {
  DecodedFeeStrategy,
  DecodedInputWitness,
  DecodedTxInput,
  DecodedTxOutput
} from '../../types'

interface AddressFundsTransferProps {
  userFeeIncrease?: number | null
  inputs?: DecodedTxInput[]
  inputWitness?: DecodedInputWitness[]
  outputs?: DecodedTxOutput[]
  feeStrategy?: DecodedFeeStrategy[]
}

export const AddressFundsTransfer = ({
  userFeeIncrease,
  inputs = [],
  inputWitness = [],
  outputs = [],
  feeStrategy = []
}: AddressFundsTransferProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'User Fee Increase'}
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />
    {inputs && inputs.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Inputs (${inputs.length})`}
        align={inputs.length !== 1 ? 'top' : undefined}
        value={
          <div className="TransactionPage__Stack">
            {inputs.map((input, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__Row TransactionPage__Row--lgCol">
                  <ValueCard link={`/platformAddress/${input.platformAddress.bech32m}`}>
                    <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
                      {input.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>{input.credits} credits</ValueCard>
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
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Input Witness (${inputWitness.length})`}
        align={inputWitness.length !== 1 ? 'top' : undefined}
        value={
          <div className="TransactionPage__Stack">
            {inputWitness.map((witness, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__WitnessGrid">
                  <span>Type:</span>
                  <div className="TransactionPage__Fit">
                    <ValueCard>{witness.type}</ValueCard>
                  </div>

                  <span>Signature:</span>
                  <ValueCard>
                    {witness.value && witness.value.signature && (
                      <Identifier copyButton ellipsis styles={['highlight-both']}>
                        {witness.value.signature}
                      </Identifier>
                    )}
                  </ValueCard>
                </div>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align={outputs.length !== 1 ? 'top' : undefined}
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Outputs (${outputs.length})`}
        value={
          <div className="TransactionPage__Stack">
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <div className="TransactionPage__OutputGrid">
                  <ValueCard
                    className="TransactionPage__AddressCard"
                    link={`/platformAddress/${output.platformAddress.bech32m}`}
                  >
                    <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
                      {output.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>{output.credits} credits</ValueCard>
                </div>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Fee Strategy'}
        align={feeStrategy.length !== 1 ? 'top' : undefined}
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <div className="TransactionPage__FeeRow TransactionPage__FeeRow--tight" key={index}>
                <div>{strategy.type}</div>
                <div>{strategy.value}</div>
              </div>
            ))}
          </div>
        }
      />
    )}
  </>
)
