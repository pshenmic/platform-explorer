import './FeeMultiplier.scss'

interface FeeMultiplierProps {
  value?: number
}

function FeeMultiplier ({ value }: FeeMultiplierProps) {
  if (value === undefined) return null

  const getModifier = (v: number): string => {
    if (v < 10) return 'Green'
    if (v < 25) return 'Yellow'
    if (v < 50) return 'LightOrange'
    if (v < 75) return 'Orange'
    if (v < 100) return 'RedOrange'
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
