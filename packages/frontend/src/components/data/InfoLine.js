import './InfoLine.scss'

function InfoLine ({ title, value, loading, error, className }) {
  return (
    <div className={`InfoLine ${className || ''} ${loading ? 'InfoLine--Loading' : ''} ${error ? 'InfoLine--Error' : ''}`}>
      <div className={'InfoLine__Title'}>{title}:</div>
      <div className={'InfoLine__Value'}>
        {!error
          ? !loading && value
          : 'n/a'
        }
      </div>
    </div>
  )
}

export default InfoLine
