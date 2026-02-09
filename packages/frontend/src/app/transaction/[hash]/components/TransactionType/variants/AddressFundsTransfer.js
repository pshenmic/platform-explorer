import { Flex, Grid, Stack, Text } from '@chakra-ui/react'
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
              <ValueCard key={index}>
                <Flex direction={{ base: 'column', lg: 'row' }} align={{ lg: 'center' }} gap={4} >
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
                    {input.credits} credits
                  </ValueCard>
                  <ValueCard>
                    Nonce: {input.nonce}
                  </ValueCard>
                </Flex>
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
        align='top'
        value={
          <div>
            {inputWitness.map((witness, index) => (
              <ValueCard key={index}>
                <Flex direction={{ lg: 'row', base: 'column' }} gap={4} align={{ lg: 'center', base: 'start' }}>
                  <Flex align='center' gap={4}>
                    <div>
                      Type:
                    </div>
                    <ValueCard >
                      {witness.type}
                    </ValueCard>
                  </Flex>
                  <Flex align='center' gap={4}>
                    <div >
                      Signature:
                    </div>
                    <ValueCard >
                      {witness.value && witness.value.signature && (
                        <Flex gap={2} maxW={{ base: 100, sm: 300 }} align='center'>
                          <Text
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {witness.value.signature}
                          </Text>

                          <CopyButton text={witness.value.signature} />
                        </Flex>
                      )}
                    </ValueCard>
                  </Flex>

                </Flex>
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
          <Stack gap={2}>
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <Grid gap={4} templateColumns={{ base: '1fr', lg: '1fr 150px' }} w='100%' align='center'>
                  <ValueCard>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {output.address}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>
                    {output.credits} credits
                  </ValueCard>
                </Grid>
              </ValueCard>

            ))}
          </Stack>
        }
      />
    )}

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Fee Strategy'}
        align='top'
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex gap={4} key={index} >
                <div >{strategy.type}</div>
                <div >{strategy.value}</div>
              </Flex>
            ))}
          </div>
        }
      />
    )}
  </>
)
