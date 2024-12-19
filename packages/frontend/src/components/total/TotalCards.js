import { InfoCard } from '../cards'
import ValueBlock from './ValueBlock'
import { Box } from '@chakra-ui/react'
import './TotalCards.scss'

export default function TotalCards ({ cards, event = null, loading = false }) {
  return (
    <div className={'TotalCards'}>
        {cards.map((card, i) => (
            <InfoCard link={card.link} className={'TotalCards__Item'} loading={card?.loading || loading} key={i}>
              {!loading
                ? <ValueBlock
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    formats={card.format}
                    event={event}
                  />
                : <Box h={'27px'}/>
              }
            </InfoCard>
        ))}
    </div>
  )
}
