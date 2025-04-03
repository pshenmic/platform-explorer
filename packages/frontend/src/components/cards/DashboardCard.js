'use client'

import './InfoCard.scss'
import { EpochTooltip, RateTooltip } from '../ui/Tooltips'
import { InfoIcon } from '@chakra-ui/icons'
import EpochProgress from '../networkStatus/EpochProgress'
import { InfoCard } from './'
import './DashboardCards.scss'

const CardValue = ({ value, tooltip }) => {
  if (!tooltip) return value

  // Handle different tooltip types
  if (tooltip.type === 'epoch') {
    return (
      <EpochTooltip epoch={tooltip.data}>
        <div className={'DashboardCards__TooltipValue'}>
          {value}
          <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
        </div>
      </EpochTooltip>
    )
  }

  if (tooltip.type === 'rate') {
    return (
      <RateTooltip credits={tooltip.credits} rate={tooltip.rate}>
        <span>
          {value}
          <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
        </span>
      </RateTooltip>
    )
  }

  return value
}

const DashboardCard = ({ card }) => {
  const {
    title,
    value,
    icon,
    loading = false,
    className = '',
    tooltip,
    secondaryValue,
    secondaryLabel,
    link,
    showEpochProgress,
    epoch
  } = card

  const IconComponent = typeof icon === 'function' ? icon : null

  return (
    <InfoCard
      className={`DashboardCards__Card ${className}`}
      loading={loading}
      link={link}
    >
      <div className={`DashboardCards__CardContentWrapper ${(icon && IconComponent) ? 'DashboardCards__CardContentWrapper--Icon' : ''}`}>
        <div className={'DashboardCards__CardContentWrapper'}>
          <div className={'DashboardCards__Title'}>{title}</div>

          <div className={'DashboardCards__Value'}>
            <CardValue value={value} tooltip={tooltip}/>
          </div>
        </div>

        {icon && IconComponent && <IconComponent w={'3rem'} h={'3rem'} />}
      </div>

      {secondaryValue && (
        <div className={'DashboardCards__SecondaryContainer'}>
          {secondaryLabel && <div className={'DashboardCards__SecondaryLabel'}>{secondaryLabel}: </div>}
          <div className={'DashboardCards__SecondaryValue'}>{secondaryValue}</div>
        </div>
      )}

      {showEpochProgress && epoch && (
        <EpochProgress epoch={epoch} className={'DashboardCards__EpochProgress'} />
      )}
    </InfoCard>
  )
}

export default DashboardCard
