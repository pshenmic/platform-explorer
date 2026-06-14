import { Flex, Grid, GridItem, Stack, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'

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
        align={inputs.length !== 1 && 'top'}
        value={
          <Stack gap={2}>
            {inputs.map((input, index) => (
              <ValueCard key={index}>
                <Flex
                  direction={{ base: 'column', lg: 'row' }}
                  align={{ lg: 'center' }}
                  justify='space-between'
                  gap={4}
                  w='100%'
                >
                  <ValueCard link={`/platformAddress/${input.platformAddress.bech32m}`}>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {input.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>{input.credits} credits</ValueCard>
                  <ValueCard>Nonce: {input.nonce}</ValueCard>
                </Flex>
              </ValueCard>
            ))}
          </Stack>
        }
      />
    )}

    {inputWitness && inputWitness.length > 0 && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        }
        title={`Input Witness (${inputWitness.length})`}
        align={inputWitness.length !== 1 && 'top'}
        value={
          <Stack gap={2}>
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
                  <GridItem width='fit-content' minW='min-content'>
                    <ValueCard>{witness.type}</ValueCard>
                  </GridItem>

                  <Text>Signature:</Text>
                  <ValueCard>
                    {witness.value && witness.value.signature && (
                      <Identifier
                        copyButton
                        ellipsis
                        styles={['highlight-both']}
                      >
                        {witness.value.signature}
                      </Identifier>
                    )}
                  </ValueCard>
                </Grid>
              </ValueCard>
            ))}
          </Stack>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align={outputs.length !== 1 && 'top'}
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        }
        title={`Outputs (${outputs.length})`}
        value={
          <Stack gap={2}>
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <Grid
                  gap={4}
                  templateColumns={{ base: '1r', lg: '1fr 200px' }}
                  w='100%'
                  align='center'
                >
                  <ValueCard className='TransactionPage__AddressCard' link={`/platformAddress/${output.platformAddress.bech32m}`}>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {output.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>{output.credits} credits</ValueCard>
                </Grid>
              </ValueCard>
            ))}
          </Stack>
        }
      />
    )}

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        }
        title={'Fee Strategy'}
        align={feeStrategy.length !== 1 && 'top'}
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex gap={4} key={index}>
                <div>{strategy.type}</div>
                <div>{strategy.value}</div>
              </Flex>
            ))}
          </div>
        }
      />
    )}
  </>
)
