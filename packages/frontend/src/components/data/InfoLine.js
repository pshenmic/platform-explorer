import { NotActive } from './index'
import './InfoLine.scss'

function InfoLine ({ title, value, icon, loading, error, postfix = ':', className, align = 'center' }) {
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
