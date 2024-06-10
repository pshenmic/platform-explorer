import './InfoCard.scss'

export default function InfoCard ({ clickable, children, className }) {
  return (
    <div className={`InfoCard ${className} ${clickable ? 'InfoCard--Clickable' : ''}`}>
        {children}
    </div>
  )
}
