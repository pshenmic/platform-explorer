'use client'

import type { NetworkOption } from '../../../constants/networks'
import './NetworkSelect.css'

interface DropdownProps {
  active?: string
  data?: NetworkOption[]
}

function Dropdown({ active, data }: DropdownProps) {
  return (
    <div className={'InternalNavigation'}>
      {(data ?? []).map(item => {
        const isActive = active === item.name
        const href = item.explorerBaseUrl
        const className =
          'InternalNavigation__Item' +
          (isActive ? ' is-active' : '') +
          (item.disabled ? ' is-disabled' : '')

        if (isActive || item.disabled || !href) {
          return (
            <span
              key={item.name}
              className={className}
              aria-current={isActive ? 'true' : undefined}
            >
              {item.name}
              {item.subname ? <small>{item.subname}</small> : null}
            </span>
          )
        }

        return (
          <a key={item.name} className={className} href={href} role={'option'}>
            {item.name}
            {item.subname ? <small>{item.subname}</small> : null}
          </a>
        )
      })}
    </div>
  )
}

export default Dropdown
