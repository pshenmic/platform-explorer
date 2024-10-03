function Endpoint ({ value, status, link }) {
  const statusClass = (() => {
    if (status === 'active') return 'Endpoint__Status--Active'
    if (status === 'warining') return 'Endpoint__Status--Warning'
    if (status === 'error') return 'Endpoint__Status--Error'
    return ''
  })()

  return (
    <div className={'Endpoint'}>
      <div className={'Endpoint__Value'}>{value}</div>
      {status !== undefined &&
        <div className={`Endpoint__Status ${statusClass}`}></div>
      }
    </div>
  )
}

export default Endpoint
