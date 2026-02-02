import { Flex } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { CopyButton } from '@components/ui/Buttons'

/**
 * Displays details for an Address Funds Transfer transaction.
 *
 * @param {Object} props
 * @param {number} [props.type] - Transaction type number.
 * @param {string} [props.typeString] - Transaction type string.
 * @param {number} [props.userFeeIncrease] - User fee increase amount.
 * @param {Array} [props.inputs] - Transaction inputs array.
 * @param {Array} [props.inputWitness] - Transaction witness array.
 * @param {Array} [props.outputs] - Transaction outputs array.
 * @param {Array} [props.feeStrategy] - Fee strategy array.
 * @param {string} [props.raw] - Raw transaction data.
 * @returns {JSX.Element}
 */
export const AddressFundsTransfer = ({
  userFeeIncrease,
  inputs = [],
  inputWitness = [],
  outputs = [],
  feeStrategy = []
}) => (
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
        value={
          <div>
            {inputs.map((input, index) => (
                <Flex key={index} align='center' gap={6}>
                <ValueCard>
                    <div>
                        <Identifier
                            avatar={true}
                            copyButton={true}
                            ellipsis={true}
                            styles={['highlight-both']}
                        >
                            {input.address}
                        </Identifier>
                    </div>
                </ValueCard>
                <ValueCard>
                    {input.credits} credits
                </ValueCard>
                <ValueCard>
                    Nonce: {input.nonce}
                </ValueCard>
              </Flex>
            ))}
          </div>
        }
      />
    )}

    {inputWitness && inputWitness.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Input Witness (${inputWitness.length})`}
        value={
          <div className="TransactionPage__WitnessList">
            {inputWitness.map((witness, index) => (
              <ValueCard key={index} className="TransactionPage__WitnessItem">
                <div className="TransactionPage__WitnessType">
                  Type: {witness.type}
                </div>
                {witness.value && witness.value.signature && (
                  <div className="TransactionPage__WitnessSignature">
                    <div className="TransactionPage__SignatureContent">
                      {witness.value.signature}
                      <CopyButton text={witness.value.signature} />
                    </div>
                  </div>
                )}
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align='top'
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Outputs (${outputs.length})`}
        value={
          <div className="TransactionPage__OutputsList">
            {outputs.map((output, index) => (
              <ValueCard key={index} className="TransactionPage__OutputItem">
                <div className="TransactionPage__OutputAddress">
                  <Identifier
                    avatar={true}
                    copyButton={true}
                    ellipsis={true}
                    styles={['highlight-both']}
                  >
                    {output.address}
                  </Identifier>
                </div>
                <div className="TransactionPage__OutputCredits">
                  {output.credits} credits
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
        value={
          <div className="TransactionPage__FeeStrategy">
            {feeStrategy.map((strategy, index) => (
              <div key={index} className="TransactionPage__FeeStrategyItem">
                <div className="TransactionPage__FeeStrategyType">{strategy.type}</div>
                <div className="TransactionPage__FeeStrategyValue">{strategy.value}</div>
              </div>
            ))}
          </div>
        }
      />
    )}
  </>
)
