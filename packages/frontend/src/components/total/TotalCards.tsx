import type { ComponentType, ReactNode } from 'react'
import { InfoCard as InfoCardJs } from '../cards'
import ValueBlock from './ValueBlock'
import { Box } from '@chakra-ui/react'
import './TotalCards.css'

const InfoCard = InfoCardJs as ComponentType<{
  children?: ReactNode
  link?: string
  className?: string
  loading?: boolean
  clickable?: boolean
}>

interface TotalCardItem {
  link?: string
  title?: ReactNode
  value?: ReactNode
  icon?: string | null
  format?: string[]
  loading?: boolean
}

interface TotalCardsProps {
  cards: TotalCardItem[]
  event?: string | null
  loading?: boolean
}

export default function TotalCards ({ cards, event = null, loading = false }: TotalCardsProps) {
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
