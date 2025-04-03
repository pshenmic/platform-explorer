'use client'

import { InfoCard } from './'
import './InfoCard.scss'
import './DashboardCards.scss'

const DashboardCard = ({ card }) => {
  const {
    title,
    value,
    icon,
    loading = false,
    className,
    link
  } = card

  const IconComponent = typeof icon === 'function' ? icon : null

  return (
    <InfoCard
      className={`DashboardCards__Card ${className || ''}`}
      loading={loading}
      link={link}
    >
      <div className={`DashboardCards__CardContentWrapper ${(icon && IconComponent) ? 'DashboardCards__CardContentWrapper--Icon' : ''}`}>
        <div className={'DashboardCards__CardContentWrapper'}>
          <div className={'DashboardCards__Title'}>{title}</div>

          <div className={'DashboardCards__Value'}>
            {value}
          </div>
        </div>

        {icon && IconComponent && <IconComponent w={'3rem'} h={'3rem'} />}
      </div>
    </InfoCard>
  )
}

export default DashboardCard
