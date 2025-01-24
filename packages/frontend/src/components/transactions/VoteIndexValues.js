import './VoteIndexValues.scss'

function VoteIndexValues ({ indexValues, className }) {
  return (
    <div className={`VoteIndexValues ${className || ''}`}>
      <div className={'VoteIndexValues__Titles'}>
        <div className={'VoteIndexValues__Title'}>Base 64</div>
        <div className={'VoteIndexValues__Title'}>Decoded</div>
      </div>
      {indexValues?.map((rawValue, i) => (
        <div className={'VoteIndexValues__Row'} key={i}>
          <div className={'VoteIndexValues__Col'}>{rawValue}</div>
          <div className={'VoteIndexValues__Col'}>{atob(rawValue)}</div>
        </div>
      ))}
    </div>
  )
}

export default VoteIndexValues
