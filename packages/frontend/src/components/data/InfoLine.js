function InfoLine ({ title, value, className }) {
  return (
    <div className={`InfoLine ${className}`}>
      <div className={'InfoLine__Title'}>{title}:</div>
      <div className={'InfoLine__Value'}>{value}</div>
    </div>
  )
}

export default InfoLine
