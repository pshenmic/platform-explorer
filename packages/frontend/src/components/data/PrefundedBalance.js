import { RateTooltip } from '../ui/Tooltips'
import { ValueCard } from '../cards'
import { ValueContainer } from '../ui/containers'
import { Flex } from '@chakra-ui/react'
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

  return elements?.length > 1
    ? <Flex gap={'8px'} flexDirection={'column'}>
        {elements.map((element, i) => <div key={i}>{element}</div>)}
      </Flex>
    : elements[0]
}

export default PrefundedBalance
