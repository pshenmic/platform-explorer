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
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title={title}
      value={
        <div className="TransactionPage__RawWrap">
          <ValueCard className="TransactionPage__RawTransaction">
            <Identifier copyButton ellipsis styles={['highlight-both']}>
              {value}
            </Identifier>
          </ValueCard>
        </div>
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
      className="TransactionPage__InfoLine TransactionPage__InfoLine--Inline"
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
      align="top"
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title={`Actions (${actions.length})`}
      value={
        <div className="TransactionPage__Stack">
          {actions.map((action, index) => (
            <ValueCard key={index}>
              <div className="TransactionPage__ActionsGrid">
                {fields.map(
                  ([label, key]) =>
                    action?.[key] !== undefined && (
                      <div key={key} className="TransactionPage__ActionsGridItem">
                        <span>{label}:</span>
                        <ValueCard className="TransactionPage__RawTransaction">
                          <Identifier copyButton ellipsis styles={['highlight-both']}>
                            {String(action[key])}
                          </Identifier>
                        </ValueCard>
                      </div>
                    )
                )}
              </div>
            </ValueCard>
          ))}
        </div>
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
      align="top"
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title={`Inputs (${inputs.length})`}
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
                <ValueCard>
                  <div>{input.credits} credits</div>
                </ValueCard>
                <ValueCard>Nonce: {input.nonce}</ValueCard>
              </div>
            </ValueCard>
          ))}
        </div>
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
      align="top"
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title={`Input Witness (${inputWitnesses.length})`}
      value={
        <div className="TransactionPage__Stack">
          {inputWitnesses.map((witness, index) => (
            <ValueCard key={index}>
              <div className="TransactionPage__WitnessGrid">
                <span>Type:</span>
                <div className="TransactionPage__Fit">
                  <ValueCard>{witness.type}</ValueCard>
                </div>
                <span>Signature:</span>
                <ValueCard>
                  <Identifier copyButton ellipsis styles={['highlight-both']}>
                    {witness?.value?.signature}
                  </Identifier>
                </ValueCard>
              </div>
            </ValueCard>
          ))}
        </div>
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
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title="Fee Strategy"
      value={
        <div>
          {feeStrategy.map((strategy, index) => (
            <div key={index} className="TransactionPage__FeeRow">
              <ValueCard>{strategy.type}</ValueCard>
              <ValueCard>Value: {strategy.value}</ValueCard>
            </div>
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
    typeof outputAddress === 'object' ? outputAddress?.platformAddress?.bech32m : undefined
  const link = bech32m ? `/platformAddress/${bech32m}` : undefined
  const value = bech32m ?? (typeof outputAddress === 'string' ? outputAddress : null)

  if (value === null) return null

  return (
    <InfoLine
      className="TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth"
      title="Output Address"
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
