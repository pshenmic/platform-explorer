import { CircleIcon, ArrowCornerIcon } from '../ui/icons'
import './Endpoint.scss'

function Endpoint ({ value, status, link }) {
  const iconColors = {
    active: 'green.default',
    warining: 'yellow.default',
    error: 'red.default'
  }

  const Wrapper = ({ children, ...props }) => {
    if (link) return <a href={link} target={'_blank'} rel={'noopener noreferrer'} {...props}>{children}</a>
    return <div {...props}>{children}</div>
  }

  return (
    <Wrapper className={'Endpoint'}>
      {link && <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>}
      <div className={'Endpoint__Value'}>{value}</div>
      {status !== undefined &&
        <CircleIcon className={'Endpoint__Status'} w={'8px'} h={'8px'} color={iconColors[status] || ''}/>
      }
    </Wrapper>
  )
}

export default Endpoint
