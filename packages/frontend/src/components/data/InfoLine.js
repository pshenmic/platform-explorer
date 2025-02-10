import { NotActive } from './index'
import './InfoLine.scss'

function InfoLine ({ title, value, loading, error, className }) {
  return (
    <div className={`InfoLine ${className || ''} ${loading ? 'InfoLine--Loading' : ''}`}>
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
