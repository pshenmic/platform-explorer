import { Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'

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
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='User Fee Increase'
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {inputs && inputs.length > 0 && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title={`Inputs (${inputs.length})`}
        value={
          <div>
            {inputs.map((input, index) => (
              <ValueCard key={index}>
                <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                  <ValueCard>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {input.address}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>
                    <div>{input.credits} credits</div>
                  </ValueCard>
                  <ValueCard>Nonce: {input.nonce}</ValueCard>
                </Flex>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    {inputWitness && inputWitness.length > 0 && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title={`Input Witness (${inputWitness.length})`}
        align='top'
        value={
          <div>
            {inputWitness.map((witness, index) => (
              <ValueCard key={index}>
                <Grid
                  templateColumns={{
                    base: '1fr minmax(240px, 1fr)',
                    md: '100px minmax(100px, 1fr)'
                  }}
                  gap={4}
                >
                  <Text>Type:</Text>
                  <GridItem width='fit-content'>
                    <ValueCard>{witness.type}</ValueCard>
                  </GridItem>

                  <Text>Signature:</Text>
                  <ValueCard>
                    <Identifier copyButton ellipsis styles={['highlight-both']}>
                      {witness.value.signature}
                    </Identifier>
                  </ValueCard>
                </Grid>
              </ValueCard>
            ))}
          </div>
        }
      />
    )}

    <InfoLine
      className={
        'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      }
      title={'Output'}
      value={
        <ValueCard>
          {output === null ? 'No output (null)' : JSON.stringify(output)}
        </ValueCard>
      }
    />

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title={'Fee Strategy'}
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex key={index} align='center' gap={6}>
                <ValueCard>{strategy.type}</ValueCard>
                <ValueCard>Value: {strategy.value}</ValueCard>
              </Flex>
            ))}
          </div>
        }
      />
    )}

    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='Pooling'
      value={pooling}
      error={pooling === undefined}
    />

    {outputAddress && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Output Address'
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
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Output Script'
        value={
          <ValueCard className='TransactionPage__RawTransaction'>
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {outputScript}
            </Identifier>
          </ValueCard>
        }
      />
    )}

    {raw && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Raw Transaction'
        value={
          <Grid templateColumns='minmax(300px, auto)'>
            <ValueCard className='TransactionPage__RawTransaction'>
              <Identifier copyButton ellipsis styles={['highlight-both']}>
                {raw}
              </Identifier>
            </ValueCard>
          </Grid>
        }
      />
    )}
  </>
)
