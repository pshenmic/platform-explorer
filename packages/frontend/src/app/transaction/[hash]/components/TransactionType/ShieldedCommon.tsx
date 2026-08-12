import { Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier, CreditsBlock } from '@components/data'
import type {
  DecodedFeeStrategy,
  DecodedInputWitness,
  DecodedOutputAddress,
  DecodedTxInput,
  ShieldedAction,
  WithRate
} from '../types'

interface HashInfoLineProps {
  title: string
  value?: string | null
}

export const HashInfoLine = ({ title, value }: HashInfoLineProps) => {
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

interface AmountInfoLineProps extends WithRate {
  title: string
  amount?: number | string | null
}

export const AmountInfoLine = ({ title, amount, rate }: AmountInfoLineProps) => {
  if (amount === undefined || amount === null) return null

  return (
    <InfoLine
      className='TransactionPage__InfoLine TransactionPage__InfoLine--Inline'
      title={title}
      value={<CreditsBlock credits={amount} rate={rate} />}
    />
  )
}

interface ShieldedActionsProps {
  actions?: ShieldedAction[] | null
}

export const ShieldedActions = ({ actions = [] }: ShieldedActionsProps) => {
  if (!actions || actions.length === 0) return null

  const fields: Array<[string, keyof ShieldedAction]> = [
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
                          {String(action[key])}
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

interface InputsLineProps {
  inputs?: DecodedTxInput[] | null
}

export const InputsLine = ({ inputs = [] }: InputsLineProps) => {
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

interface InputWitnessesLineProps {
  inputWitnesses?: DecodedInputWitness[] | null
}

export const InputWitnessesLine = ({ inputWitnesses = [] }: InputWitnessesLineProps) => {
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

interface FeeStrategyLineProps {
  feeStrategy?: DecodedFeeStrategy[] | null
}

export const FeeStrategyLine = ({ feeStrategy = [] }: FeeStrategyLineProps) => {
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

interface OutputAddressLineProps {
  outputAddress?: DecodedOutputAddress
}

export const OutputAddressLine = ({ outputAddress }: OutputAddressLineProps) => {
  if (outputAddress === undefined || outputAddress === null) return null

  const bech32m =
    typeof outputAddress === 'object'
      ? outputAddress?.platformAddress?.bech32m
      : undefined
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
