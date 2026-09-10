import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'
import type { PublicKeyData } from 'src/components/transactions/PublicKeyCard'
import type { DecodedInputWitness, DecodedTxInput, DecodedTxOutput, WithLoading } from '../../types'

interface IdentityCreateFromAddressesProps extends WithLoading {
  publicKeys?: PublicKeyData[] | null
  userFeeIncrease?: number | null
  inputs?: DecodedTxInput[]
  inputWitness?: DecodedInputWitness[]
  outputs?: DecodedTxOutput[]
}

export const IdentityCreateFromAddresses = ({
  publicKeys,
  userFeeIncrease,
  inputs = [],
  inputWitness = [],
  outputs = [],
  loading
}: IdentityCreateFromAddressesProps) => (
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

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
      title={`Public Keys${publicKeys !== undefined ? ` (${publicKeys?.length})` : ''}`}
      value={
        <>
          {publicKeys?.map((publicKey, i) => (
            <PublicKeyCard
              className={'TransactionPage__PublicKeyCard'}
              publicKey={publicKey}
              key={i}
            />
          ))}
        </>
      }
      loading={loading}
      error={publicKeys === undefined}
    />
  </>
)
