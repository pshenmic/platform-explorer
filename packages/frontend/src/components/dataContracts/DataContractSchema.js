import { Code, Button } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { CopyButton } from '../ui/Buttons'
import './DataContractSchema.scss'

function DataContractSchema ({ schema }) {
  const [fullSize, setFullSize] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const parsedSchema = schema ? JSON.stringify(JSON.parse(schema), null, 2) : ''
  const codeContainerRef = useRef(null)
  const codeRef = useRef(null)

  useEffect(() => {
    const container = codeContainerRef?.current
    const code = codeRef?.current

    const checkOverflow = () => {
      if (container && code) {
        setIsOverflowing(code.clientHeight > container.clientHeight)
      }
    }

    const observer = new ResizeObserver(checkOverflow)
    if (codeContainerRef) observer.observe(container)
    if (codeRef) observer.observe(code)

    checkOverflow()

    return () => { if (observer) observer.disconnect() }
  }, [])

  return (
    <div className={'DataContractSchema'}>
      <div className={'DataContractSchema__CodeContainer'} >
        <Code
          className={`DataContractSchema__Code ${fullSize ? 'DataContractSchema__Code--FullSize' : ''}`}
          borderRadius={'lg'}
          px={5}
          py={4}
          ref={codeContainerRef}
        >
          <div ref={codeRef}>{parsedSchema}</div>
        </Code>

        <CopyButton className={'DataContractSchema__CopyButton'} text={parsedSchema}/>
      </div>

      {(isOverflowing || fullSize) &&
        <Button
          size={'sm'}
          onClick={() => setFullSize(state => !state)}
          className={'DataContractSchema__FullSizeButton'}
        >
          {fullSize ? 'Hide code' : 'Show full code'}
        </Button>
      }
    </div>
  )
}

export default DataContractSchema
