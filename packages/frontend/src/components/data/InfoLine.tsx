import type { ReactNode } from 'react'
import type { WithClassName } from '../../types/common'
import { NotActive } from './index'
import './InfoLine.css'

interface InfoLineProps extends WithClassName {
  title?: ReactNode
  value?: ReactNode
  icon?: ReactNode
  loading?: boolean
  error?: boolean
  postfix?: string
  align?: 'center' | 'top' | string
}

function InfoLine ({ title, value, icon, loading, error, postfix = ':', className, align = 'center' }: InfoLineProps) {
  return (
    <div className={`InfoLine ${className || ''} ${loading ? 'InfoLine--Loading' : ''} ${align === 'top' ? 'InfoLine__Align--top' : ''}`}>
      {icon && <div className={'InfoLine__Icon'}>{icon}</div>}
      <div className={'InfoLine__Title'}>{title}{postfix}</div>
      <div className={'InfoLine__Value'}>
        {!error
          ? !loading && value
          : <NotActive/>
        }
      </div>
    </div>
  )
}

export default InfoLine
