import './InfoCard.scss'

export default function InfoCard ({ children, className }) {
  return (
    <div className={`InfoCard ${className}`}>
        {children}
    </div>
  )
}
