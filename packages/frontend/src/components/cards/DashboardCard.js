'use client'

import { InfoCard } from './'
import './InfoCard.scss'
import './DashboardCard.scss'

const DashboardCard = ({ card, className: extraClass }) => {
  const {
    title,
    value,
    icon,
    error,
    loading,
    className,
    link
  } = card

  const IconComponent = typeof icon === 'function' ? icon : null

  return (
    <InfoCard
      className={`DashboardCard ${className || ''} ${extraClass || ''}`}
      loading={loading}
      link={link}
    >
      <div className={`DashboardCard__ContentWrapper ${(icon && IconComponent) ? 'DashboardCard__ContentWrapper--Icon' : ''}`}>
        <div className={'DashboardCard__Content'}>
          {title &&
            <div className={'DashboardCard__Title'}>{title}</div>
          }

          <div className={'DashboardCard__Value'}>
            {!error ? value : 'N/A'}
          </div>
        </div>

        {icon && IconComponent && <IconComponent w={'3rem'} h={'3rem'} />}
      </div>
    </InfoCard>
  )
}

export default DashboardCard
