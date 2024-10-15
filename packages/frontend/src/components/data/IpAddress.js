import './IpAddress.scss'

function splitIpAndPort(address) {
  if (!address) return { ip: null, port: null }

  if (address.includes(':')) {
    const [ip, port] = address.split(':')

    if (ip.split('.').length > 0) {
      return { ip, port }
    }
  }
  
  return { ip: address, port: null }
}


function IpAddress ({ children, className }) {
  if (!children) return

  const { ip, port } = splitIpAndPort(children)

  return (
    <div className={`IpAddress ${className}`}>
      <span className={'IpAddress__Ip'}>{ip}</span>
      {port && <>:<span className={'IpAddress__Port'}>{port}</span></>}
    </div>
  )
}

export default IpAddress
