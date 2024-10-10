import './IpAddress.scss'

function IpAddress ({ address, port, className }) {
  return (
    <div className={`IpAddress ${className}`}>
      <span className={'IpAddress__Ip'}>{address}</span>
      {port !== undefined && ':'}
      <span className={'IpAddress__Port'}>{port}</span>
    </div>
  )
}

export default IpAddress
