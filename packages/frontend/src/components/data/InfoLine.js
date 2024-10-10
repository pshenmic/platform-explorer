import './InfoLine.scss'

function InfoLine ({ title, value, loading, className }) {
  return (
    <div className={`InfoLine ${className || ''} ${loading ? 'InfoLine--Loading' : ''}`}>
      <div className={'InfoLine__Title'}>{title}:</div>
      <div className={'InfoLine__Value'}>{!loading && value}</div>
    </div>
  )
}

export default InfoLine
