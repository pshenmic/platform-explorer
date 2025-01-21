'use client'

import { useEffect, useRef, useState } from 'react'
import { Code, Button } from '@chakra-ui/react'
import { CopyButton } from '../ui/Buttons'
import { SmoothSize } from '../ui/containers'
import './CodeBlock.scss'

function CodeBlock ({ code }) {
  const [fullSize, setFullSize] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const parsedCode = code ? JSON.stringify(JSON.parse(code), null, 2) : ''
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
    <div className={'CodeBlock'}>
      <div className={'CodeBlock__CodeContainer'}>
        <SmoothSize>
          <Code
            className={`CodeBlock__Code ${fullSize ? 'CodeBlock__Code--FullSize' : ''}`}
            borderRadius={'lg'}
            px={5}
            py={4}
            ref={codeContainerRef}
          >
            <div ref={codeRef}>{parsedCode}</div>
          </Code>
        </SmoothSize>

        <CopyButton className={'CodeBlock__CopyButton'} text={parsedCode}/>
      </div>

      {(isOverflowing || fullSize) &&
        <Button
          size={'sm'}
          onClick={() => setFullSize(state => !state)}
          className={'CodeBlock__FullSizeButton'}
        >
          {fullSize ? 'Hide code' : 'Show full code'}
        </Button>
      }
    </div>
  )
}

export default CodeBlock