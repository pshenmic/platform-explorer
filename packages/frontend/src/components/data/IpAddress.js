import './IpAddress.scss'

function splitIpAndPort (address) {
  if (!address) return { host: null, port: null }

  if (address.includes(':')) {
    const [host, port] = address.split(':')

    if (host.split('.').length > 0) {
      return { host, port }
    }
  }

  return { host: address, port: null }
}

function IpAddress ({ children, host, port, className }) {
  if (!children && !host) return

  if (!host && !port) {
    const addressData = splitIpAndPort(children)
    host = addressData.host
    port = addressData.port
  }

  return (
    <div className={`IpAddress ${className}`}>
      <span className={'IpAddress__Host'}>{host}</span>
      {port && <>:<span className={'IpAddress__Port'}>{port}</span></>}
    </div>
  )
}

export default IpAddress
