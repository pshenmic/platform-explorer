import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'
import './IpAddress.css'

function splitIpAndPort(address: string | null | undefined): {
  host: string | null
  port: string | null
} {
  if (!address) return { host: null, port: null }

  if (address.includes(':')) {
    const [host, port] = address.split(':')

    if (host.split('.').length > 0) {
      return { host, port }
    }
  }

  return { host: address, port: null }
}

interface IpAddressProps extends WithChildren, WithClassName {
  host?: string | null
  port?: string | number | null
  variant?: string
  clickable?: boolean
}

function IpAddress({ children, host, port, variant, clickable = true, className }: IpAddressProps) {
  if (!children && !host) return

  const extraClass = (() => {
    let res = ''
    if (clickable) res += 'IpAddress--Clickable'
    if (variant === 'dim') res += ' ' + 'IpAddress--Dim'
    return res
  })()

  let resolvedHost = host
  let resolvedPort = port

  if (!resolvedHost && !resolvedPort) {
    const addressData = splitIpAndPort(
      typeof children === 'string' ? children : String(children ?? '')
    )
    resolvedHost = addressData.host
    resolvedPort = addressData.port
  }

  return (
    <div className={`IpAddress ${extraClass} ${className || ''}`}>
      <span className={'IpAddress__Host'}>{resolvedHost}</span>
      {resolvedPort && (
        <>
          :<span className={'IpAddress__Port'}>{resolvedPort}</span>
        </>
      )}
    </div>
  )
}

export default IpAddress
