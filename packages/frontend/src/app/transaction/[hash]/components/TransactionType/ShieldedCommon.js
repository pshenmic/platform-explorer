import { Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'

/**
 * Renders a long hex / opaque value (anchor, proof, bindingsSignature, raw,
 * outputScript) inside a full-width InfoLine.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.value]
 * @returns {JSX.Element|null}
 */
export const HashInfoLine = ({ title, value }) => {
  if (value === undefined || value === null || value === '') return null

  return (
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      title={title}
      value={
        <Grid templateColumns='minmax(300px, auto)'>
          <ValueCard className='TransactionPage__RawTransaction'>
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {value}
            </Identifier>
          </ValueCard>
        </Grid>
      }
    />
  )
}

/**
 * Renders a credits amount (amount / valueBalance / unshieldingAmount) as an
 * inline InfoLine using the shared CreditsBlock component.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {number|string} [props.amount]
 * @param {Object} [props.rate]
 * @returns {JSX.Element|null}
 */
export const AmountInfoLine = ({ title, amount, rate }) => {
  if (amount === undefined || amount === null) return null

  return (
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title={title}
      value={<CreditsBlock credits={amount} rate={rate} />}
    />
  )
}

/**
 * Renders the shielded actions array (private spend/output descriptions:
 * nullifier, rk, cmx, encryptedNote, cvNet, spendAuthSig).
 *
 * @param {Object} props
 * @param {Array} [props.actions]
 * @returns {JSX.Element|null}
 */
export const ShieldedActions = ({ actions = [] }) => {
  if (!actions || actions.length === 0) return null

  const fields = [
    ['Nullifier', 'nullifier'],
    ['Randomized Key (rk)', 'rk'],
    ['Note Commitment (cmx)', 'cmx'],
    ['Value Commitment (cvNet)', 'cvNet'],
    ['Encrypted Note', 'encryptedNote'],
    ['Spend Auth Signature', 'spendAuthSig']
  ]

  return (
    <InfoLine
      align='top'
      className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      title={`Actions (${actions.length})`}
      value={
        <Flex direction='column' gap={2}>
          {actions.map((action, index) => (
            <ValueCard key={index}>
              <Grid
                templateColumns={{
                  base: 'minmax(220px, 1fr)',
                  md: '200px minmax(100px, 1fr)'
                }}
                gap={3}
                alignItems='center'
              >
                {fields.map(([label, key]) =>
                  action?.[key] !== undefined && (
                    <GridItem key={key} display='contents'>
                      <Text>{label}:</Text>
                      <ValueCard className='TransactionPage__RawTransaction'>
                        <Identifier copyButton ellipsis styles={['highlight-both']}>
                          {action[key]}
                        </Identifier>
                      </ValueCard>
                    </GridItem>
                  )
                )}
              </Grid>
            </ValueCard>
          ))}
        </Flex>
      }
    />
  )
}

/**
 * Renders the transparent inputs array (Platform addresses funding the pool).
 *
 * @param {Object} props
 * @param {Array} [props.inputs]
 * @returns {JSX.Element|null}
 */
export const InputsLine = ({ inputs = [] }) => {
  if (!inputs || inputs.length === 0) return null

  return (
    <InfoLine
      align='top'
      className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      title={`Inputs (${inputs.length})`}
      value={
        <Flex direction='column' gap={2}>
          {inputs.map((input, index) => (
            <ValueCard key={index}>
              <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
                <ValueCard link={`/platformAddress/${input.platformAddress.bech32m}`}>
                  <Identifier avatar copyButton ellipsis styles={['highlight-both']}>
                    {input.platformAddress.bech32m}
                  </Identifier>
                </ValueCard>
                <ValueCard><div>{input.credits} credits</div></ValueCard>
                <ValueCard>Nonce: {input.nonce}</ValueCard>
              </Flex>
            </ValueCard>
          ))}
        </Flex>
      }
    />
  )
}

/**
 * Renders the input witnesses array.
 *
 * @param {Object} props
 * @param {Array} [props.inputWitnesses]
 * @returns {JSX.Element|null}
 */
export const InputWitnessesLine = ({ inputWitnesses = [] }) => {
  if (!inputWitnesses || inputWitnesses.length === 0) return null

  return (
    <InfoLine
      align='top'
      className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      title={`Input Witness (${inputWitnesses.length})`}
      value={
        <Flex direction='column' gap={2}>
          {inputWitnesses.map((witness, index) => (
            <ValueCard key={index}>
              <Grid
                templateColumns={{
                  base: '1fr minmax(240px, 1fr)',
                  md: '100px minmax(100px, 1fr)'
                }}
                gap={4}
              >
                <Text>Type:</Text>
                <GridItem width='fit-content'><ValueCard>{witness.type}</ValueCard></GridItem>
                <Text>Signature:</Text>
                <ValueCard>
                  <Identifier copyButton ellipsis styles={['highlight-both']}>
                    {witness?.value?.signature}
                  </Identifier>
                </ValueCard>
              </Grid>
            </ValueCard>
          ))}
        </Flex>
      }
    />
  )
}

/**
 * Renders the fee strategy array.
 *
 * @param {Object} props
 * @param {Array} [props.feeStrategy]
 * @returns {JSX.Element|null}
 */
export const FeeStrategyLine = ({ feeStrategy = [] }) => {
  if (!feeStrategy || feeStrategy.length === 0) return null

  return (
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
  )
}

/**
 * Renders an output address that may be either a plain string (SHIELDED_WITHDRAWAL)
 * or an object with a nested platformAddress (UNSHIELD).
 *
 * @param {Object} props
 * @param {Object|string} [props.outputAddress]
 * @returns {JSX.Element|null}
 */
export const OutputAddressLine = ({ outputAddress }) => {
  if (outputAddress === undefined || outputAddress === null) return null

  const bech32m = outputAddress?.platformAddress?.bech32m
  const link = bech32m ? `/platformAddress/${bech32m}` : undefined
  const value = bech32m ?? (typeof outputAddress === 'string' ? outputAddress : null)

  if (value === null) return null

  return (
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'
      title='Output Address'
      value={
        <ValueCard {...(link ? { link } : {})}>
          <Identifier avatar={!!bech32m} copyButton ellipsis styles={['highlight-both']}>
            {value}
          </Identifier>
        </ValueCard>
      }
    />
  )
}
