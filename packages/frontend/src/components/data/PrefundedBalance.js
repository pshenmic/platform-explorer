import { RateTooltip } from '../ui/Tooltips'
import { ValueCard } from '../cards'
import { ValueContainer } from '../ui/containers'
import './PrefundedBalance.scss'

function PrefundedBalance ({ prefundedBalance, rate }) {
  const elements = []

  for (const [title, value] of Object.entries(prefundedBalance)) {
    elements.push(
      <ValueCard className={'PrefundedBalance'}>
        <ValueContainer className={'PrefundedBalance__Title'}>
          {title}
        </ValueContainer>
        <ValueContainer className={'PrefundedBalance__Value'} colorScheme={'green'}>
          <RateTooltip credits={Number(value)} rate={rate?.data}>
            <span>{value} Credits</span>
          </RateTooltip>
        </ValueContainer>
      </ValueCard>
    )
  }

  return (
    <>{elements.map((element) => element)}</>
  )
}

export default PrefundedBalance
