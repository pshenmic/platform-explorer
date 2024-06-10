import { InfoCard } from './'
import './CardsGrid.scss'

function CardsGrid ({ children, className }) {
  return <div className={`CardsGrid ${className || ''}`}>{children}</div>
}

function CardsGridHeader ({ children, className }) {
  return <div className={`CardsGrid__Header ${className || ''}`}>{children}</div>
}

function CardsGridTitle ({ children, className }) {
  return <div className={`CardsGrid__Header ${className || ''}`}>{children}</div>
}

function CardsGridItems ({ children, className }) {
  return <div className={`CardsGrid__Items ${className || ''}`}>{children}</div>
}

function CardsGridItem ({ children, className, loading, clickable }) {
  return <InfoCard className={`CardsGrid__Item ${className || ''}`} loading={loading} clickable={clickable}>{children || ''}</InfoCard>
}

export {
  CardsGrid,
  CardsGridItems,
  CardsGridItem,
  CardsGridHeader,
  CardsGridTitle
}
