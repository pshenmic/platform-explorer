import { Flex } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { CopyButton } from '@components/ui/Buttons'

/**
 * Displays details for an Address Credit Withdrawal transaction.
 *
 * @param {Object} props
 * @param {number} [props.type] - Transaction type number.
 * @param {string} [props.typeString] - Transaction type string.
 * @param {number} [props.userFeeIncrease] - User fee increase amount.
 * @param {Array} [props.inputs] - Transaction inputs array.
 * @param {Array} [props.inputWitness] - Transaction witness array.
 * @param {Object} [props.output] - Transaction output (null for this type).
 * @param {Array} [props.feeStrategy] - Fee strategy array.
 * @param {number} [props.pooling] - Pooling value.
 * @param {string} [props.outputAddress] - Output address.
 * @param {string} [props.outputScript] - Output script.
 * @param {string} [props.raw] - Raw transaction data.
 * @returns {JSX.Element}
 */
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
              <Flex key={index} align='center' gap={6} mb={4}>
                <ValueCard>
                  <Identifier
                    avatar={true}
                    copyButton={true}
                    ellipsis={true}
                    styles={['highlight-both']}
                  >
                    {input.address}
                  </Identifier>
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
          <div>
            {inputWitness.map((witness, index) => (
              <Flex key={index} direction="column" gap={4} mb={4}>
                <Flex align='center' gap={6}>
                  <ValueCard>
                    Type: {witness.type}
                  </ValueCard>
                </Flex>
                {witness.value && witness.value.signature && (
                  <ValueCard>
                    <div>
                      {witness.value.signature}
                      <CopyButton text={witness.value.signature} />
                    </div>
                  </ValueCard>
                )}
              </Flex>
            ))}
          </div>
        }
      />
    )}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
      title={'Output'}
      value={
        <ValueCard>
          {output === null ? 'No output (null)' : JSON.stringify(output)}
        </ValueCard>
      }
    />

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Fee Strategy'}
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex key={index} align='center' gap={6} >
                <ValueCard>
                  {strategy.type}
                </ValueCard>
                <ValueCard>
                  Value: {strategy.value}
                </ValueCard>
              </Flex>
            ))}
          </div>
        }
      />
    )}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'Pooling'}
      value={pooling}
      error={pooling === undefined}
    />

    {outputAddress && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Output Address'}
        value={
          <ValueCard>
            <Identifier
              avatar={true}
              copyButton={true}
              ellipsis={true}
              styles={['highlight-both']}
            >
              {outputAddress}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    {outputScript && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Output Script'}
        value={
          <ValueCard>
            <div>
              {outputScript}
              <CopyButton text={outputScript} />
            </div>
          </ValueCard>
        }
      />
    )}

    {raw && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Raw Transaction'}
        value={
          <ValueCard className={'TransactionPage__RawTransaction'}>
            <div>
              {raw}
              <CopyButton text={raw} />
            </div>
          </ValueCard>
        }
      />
    )}
  </>
)
