import { CircleIcon, ArrowCornerIcon } from '../ui/icons'
import './Endpoint.scss'

function Endpoint ({ value, status, link }) {
  const iconColor = (() => {
    if (status === 'active') return 'green.default'
    if (status === 'warining') return 'yellow.default'
    if (status === 'error') return 'red.default'
    return ''
  })()

  const Wrapper = ({ children, ...props }) => {
    if (link) return <a href={link} target={'_blank'} rel={'noopener noreferrer'} {...props}>{children}</a>
    return <div {...props}>{children}</div>
  }

  return (
    <Wrapper className={'Endpoint'}>
      {link && <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'10px'}/>}
      <div className={'Endpoint__Value'}>{value}</div>
      {status !== undefined &&
        <CircleIcon className={'Endpoint__Status'} w={'8px'} h={'8px'} color={iconColor}/>
      }
    </Wrapper>
  )
}

export default Endpoint
