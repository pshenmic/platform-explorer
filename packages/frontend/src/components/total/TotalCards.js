import { InfoCard } from '../cards'
import ValueBlock from './ValueBlock'
import { Box } from '@chakra-ui/react'
import './TotalCards.scss'

export default function TotalCards ({ cards, loading = false }) {
  return (
    <div className={'TotalCards'}>
        {cards.map((card, i) => (
            <InfoCard clickable={card.link} link={card.link} className={'TotalCards__Item'} loading={loading} key={i}>
              {!loading
                ? <ValueBlock
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    formats={card.format}
                  />
                : <Box h={'27px'}/>
              }
            </InfoCard>
        ))}
    </div>
  )
}
