import './TickerBadge.scss'

function TickerBadge ({ children, className }) {
  return (
    <div className={`TickerBadge ${className || ''}`}>
      {children}
    </div>
  )
}

export default TickerBadge
