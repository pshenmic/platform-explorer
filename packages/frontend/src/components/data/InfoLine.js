import { NotActive } from './index'
import './InfoLine.scss'

function InfoLine ({ title, value, icon, loading, error, className }) {
  return (
    <div className={`InfoLine ${className || ''} ${loading ? 'InfoLine--Loading' : ''}`}>
      {icon && <div className={'InfoLine__Icon'}>{icon}</div>}
      <div className={'InfoLine__Title'}>{title}:</div>
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
