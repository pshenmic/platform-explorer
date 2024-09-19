import { Tooltip as ChakraTooltip } from '@chakra-ui/react'
import './Tooltip.scss'

export default function Tooltip ({ title = '', content = '', ...props }) {
  const extraClass = title && content ? 'Tooltip--Extended' : ''

  return (
    <ChakraTooltip
      className={`Tooltip ${extraClass}`}
      label={
        <div className={''}>
          <div className={'Tooltip__Title'}>{title}</div>
          <div className={'Tooltip__Content'}>{content}</div>
        </div>
      }
      borderRadius={'10px'}
      border={'4px solid'}
      borderColor={'gray.750'}
      background={'gray.675'}
      borderLeft={'none'}
      borderRight={'none'}
      padding={'18px 24px'}
      {...props}
    />
  )
}
