import type { WithChildren, WithClassName } from '../../types/common'
import { InfoCard } from './'
import './CardsGrid.scss'

interface CardsGridProps extends WithChildren, WithClassName {
  itemsCount?: number | null
}

function CardsGrid ({ children, className, itemsCount = null }: CardsGridProps) {
  const justifyClass = (itemsCount && itemsCount % 3 === 0) ? 'CardsGrid--DivideBy3' : ''
  return <div className={`CardsGrid ${justifyClass} ${className || ''}`}>{children}</div>
}

function CardsGridHeader ({ children, className }: WithChildren & WithClassName) {
  return <div className={`CardsGrid__Header ${className || ''}`}>{children}</div>
}

function CardsGridTitle ({ children, className }: WithChildren & WithClassName) {
  return <div className={`CardsGrid__Header ${className || ''}`}>{children}</div>
}

function CardsGridItems ({ children, className }: WithChildren & WithClassName) {
  return <div className={`CardsGrid__Items ${className || ''}`}>{children}</div>
}

interface CardsGridItemProps extends WithChildren, WithClassName {
  loading?: boolean
  clickable?: boolean
}

function CardsGridItem ({ children, className, loading, clickable }: CardsGridItemProps) {
  return <InfoCard className={`CardsGrid__Item ${className || ''}`} loading={loading} clickable={clickable}>{children || ''}</InfoCard>
}

export {
  CardsGrid,
  CardsGridItems,
  CardsGridItem,
  CardsGridHeader,
  CardsGridTitle
}
