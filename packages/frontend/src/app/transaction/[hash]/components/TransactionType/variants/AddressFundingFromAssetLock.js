import { Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { CopyButton } from '@components/ui/Buttons'

/**
 * Displays details for an Address Funding from Asset Lock transaction.
 *
 * @param {Object} props
 * @param {number} [props.type] - Transaction type number.
 * @param {string} [props.typeString] - Transaction type string.
 * @param {Object} [props.assetLockProof] - Asset lock proof details.
 * @param {number} [props.userFeeIncrease] - User fee increase amount.
 * @param {Array} [props.inputs] - Transaction inputs array.
 * @param {Array} [props.inputWitness] - Transaction witness array.
 * @param {Array} [props.outputs] - Transaction outputs array.
 * @param {Array} [props.feeStrategy] - Fee strategy array.
 * @param {string} [props.signature] - Transaction signature.
 * @returns {JSX.Element}
 */
export const AddressFundingFromAssetLock = ({
  assetLockProof,
  userFeeIncrease,
  outputs = [],
  feeStrategy = [],
  signature
}) => (
  <>
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title='User Fee Increase'
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {assetLockProof && (
      <InfoLine
        align='top'
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Asset Lock Proof'
        value={
          <Grid
            templateColumns={{
              base: 'minmax(250px, auto)',
              md: '1fr 400px',
              lg: '1fr 500px'
            }}
            px={{ base: 5, md: 0 }}
            gap={4}
          >
            <GridItem>
              <Text>Type:</Text>
            </GridItem>
            <GridItem>
              <ValueCard>{assetLockProof.type}</ValueCard>
            </GridItem>

            {assetLockProof.coreChainLockedHeight !== null && (
              <>
                <GridItem>
                  <Text>Core Chain Locked Height:</Text>
                </GridItem>
                <GridItem>
                  <ValueCard>{assetLockProof.coreChainLockedHeight}</ValueCard>
                </GridItem>
              </>
            )}
            <GridItem>
              <Text>Funding Amount:</Text>
            </GridItem>
            <GridItem>
              <ValueCard>{assetLockProof.fundingAmount} satoshis</ValueCard>
            </GridItem>
            <GridItem>
              <Text>Output Index (vout):</Text>
            </GridItem>
            <GridItem>
              <ValueCard>{assetLockProof.vout}</ValueCard>
            </GridItem>

            <GridItem colSpan={1}>
              <Text>Funding Core Transaction:</Text>
            </GridItem>
            <GridItem>
              <ValueCard mb={2}>
                <Identifier
                  copyButton={true}
                  ellipsis={true}
                  styles={['highlight-both']}
                >
                  {assetLockProof.fundingCoreTx}
                </Identifier>
              </ValueCard>
            </GridItem>

            <GridItem colSpan={1}>
              <Flex align='center' h='100%'>
                <Text>Instant Lock:</Text>
              </Flex>
            </GridItem>
            <GridItem>
              <ValueCard className={'TransactionPage__RawTransaction'}>
                <div>
                  {assetLockProof.instantLock}
                  <CopyButton text={assetLockProof.instantLock} />
                </div>
              </ValueCard>
            </GridItem>
          </Grid>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align='top'
        className={
          'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        }
        title={`Outputs (${outputs.length})`}
        value={
          <Flex direction='column' gap={2}>
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <Flex
                  gap={4}
                  direction={{ base: 'column', md: 'row' }}
                  maxW={{ base: 270, md: 'none' }}
                >
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
                    <div>{output.credits} credits</div>
                  </ValueCard>
                </Flex>
              </ValueCard>
            ))}
          </Flex>
        }
      />
    )}

    {feeStrategy && feeStrategy.length > 0 && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Fee Strategy'
        value={
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex key={index} align='center' gap={6} mb={4}>
                <ValueCard>{strategy.type}</ValueCard>
                <ValueCard>Value: {strategy.value}</ValueCard>
              </Flex>
            ))}
          </div>
        }
      />
    )}

    {signature && (
      <InfoLine
        className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
        title='Signature'
        value={
          <ValueCard>
            <Flex
              gap={2}
              maxW={{ base: 250, sm: 400 }}
              align='center'
              justify='space-between'
            >
              <Text
                overflow='hidden'
                textOverflow='ellipsis'
                whiteSpace='nowrap'
              >
                {signature}
              </Text>

              <CopyButton text={signature} />
            </Flex>
          </ValueCard>
        }
      />
    )}
  </>
)
