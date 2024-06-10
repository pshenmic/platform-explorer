import './InfoCard.scss'

export default function InfoCard ({ clickable, loading, children, className }) {
  return (
    <div className={`InfoCard ${className} ${clickable ? 'InfoCard--Clickable' : ''} ${loading ? 'InfoCard--Loading' : ''}`}>
        {children}
    </div>
  )
}
