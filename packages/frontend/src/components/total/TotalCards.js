import { InfoCard } from '../cards'
import ValueBlock from './ValueBlock'
import './TotalCards.scss'

export default function TotalCards ({ cards }) {
  return (
    <div className={'TotalCards'}>
        {cards.map((card, i) => (
            <InfoCard className={'TotalCards__Item'} key={i}>
                <ValueBlock
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                />
            </InfoCard>
        ))}
    </div>
  )
}
