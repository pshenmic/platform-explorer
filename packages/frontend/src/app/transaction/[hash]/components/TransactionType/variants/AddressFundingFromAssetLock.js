import { Flex, Grid, GridItem } from '@chakra-ui/react'
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
  inputs = [],
  inputWitness = [],
  outputs = [],
  feeStrategy = [],
  signature
}) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'User Fee Increase'}
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {assetLockProof && (
      <InfoLine
        align='top'
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Asset Lock Proof'}
        value={
          <div>
            <Flex align='center' gap={6} mb={4}>
              <ValueCard>
                Type: {assetLockProof.type}
              </ValueCard>
              {assetLockProof.coreChainLockedHeight !== null && (
                <ValueCard>
                  Core Chain Locked Height: {assetLockProof.coreChainLockedHeight}
                </ValueCard>
              )}
            </Flex>

            <Flex align='center' gap={6} mb={4}>
              <ValueCard>
                Funding Amount: {assetLockProof.fundingAmount} satoshis
              </ValueCard>
              <ValueCard>
                Output Index (vout): {assetLockProof.vout}
              </ValueCard>
            </Flex>

            <Grid templateColumns="repeat(2, 1fr)" gap="6">

              <GridItem colSpan={1}>
                <div>Funding Core Transaction:</div>
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
                <div>Instant Lock:</div>
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
          </div>
        }
      />
    )}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
      title={'Inputs'}
      value={
        <div className="TransactionPage__EmptyList">
          No inputs for this transaction type
        </div>
      }
    />

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
      title={'Input Witness'}
      value={
        <div className="TransactionPage__EmptyList">
          No witness data for this transaction
        </div>
      }
    />

    {outputs && outputs.length > 0 && (
      <InfoLine
        align='top'
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Outputs (${outputs.length})`}
        value={
          <div>
            {outputs.map((output, index) => (
              <Flex key={index} align='center' gap={6} mb={4}>
                <ValueCard>
                  <Identifier
                    avatar={true}
                    copyButton={true}
                    ellipsis={true}
                    styles={['highlight-both']}
                  >
                    {output.address}
                  </Identifier>
                </ValueCard>
                <ValueCard>
                  {output.credits} credits
                </ValueCard>
              </Flex>
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
          <div>
            {feeStrategy.map((strategy, index) => (
              <Flex key={index} align='center' gap={6} mb={4}>
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

    {signature && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={'Signature'}
        value={
          <ValueCard>
            <div>
              {signature}
              <CopyButton text={signature} />
            </div>
          </ValueCard>
        }
      />
    )}
  </>
)
