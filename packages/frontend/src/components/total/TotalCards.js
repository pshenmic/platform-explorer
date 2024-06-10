import { InfoCard } from '../cards'
import ValueBlock from './ValueBlock'
import './TotalCards.scss'

export default function TotalCards ({ cards, loading = false }) {
  return (
    <div className={'TotalCards'}>
        {cards.map((card, i) => (
            <InfoCard className={'TotalCards__Item'} loading={loading} key={i}>
              {!loading &&
                <ValueBlock
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                />
              }
            </InfoCard>
        ))}
    </div>
  )
}
