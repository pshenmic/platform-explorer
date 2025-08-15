import { CirclePauseIcon, CirclePlayIcon } from '../ui/icons'
import { ValueContainer } from '../ui/containers'
import './TokenEmergencyActionBadge.scss'

const TokenEmergencyActionBadge = ({ type, size = 'sm', ...props }) => {
  const colorScheme = {
    pause: 'red',
    resume: 'green',
    default: 'gray'
  }

  const icons = {
    pause: <CirclePauseIcon w={6} h={6}/>,
    resume: <CirclePlayIcon w={6} h={6}/>
  }

  return (
    <ValueContainer
      className={'TokenEmergencyActionBadge'}
      size={size}
      colorScheme={colorScheme?.[String(type).toLowerCase()]}
      {...props}
    >
      <div className={'TokenEmergencyActionBadge__Content'}>
        {icons?.[String(type).toLowerCase()]}
        {type}
      </div>
    </ValueContainer>
  )
}

export default TokenEmergencyActionBadge
