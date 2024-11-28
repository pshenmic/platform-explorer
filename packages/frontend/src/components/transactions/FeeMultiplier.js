import './FeeMultiplier.scss'

function FeeMultiplier ({ value }) {
  if (value === undefined) return null

  const getModifier = (value) => {
    if (value < 10) return 'Green'
    if (value < 25) return 'Yellow'
    if (value < 50) return 'LightOrange'
    if (value < 75) return 'Orange'
    if (value < 100) return 'RedOrange'
    return 'Red'
  }

  const modifier = getModifier(value)

  return (
    <div className={`FeeMultiplier FeeMultiplier--${modifier}`}>
      +{value}%
    </div>
  )
}

export default FeeMultiplier
