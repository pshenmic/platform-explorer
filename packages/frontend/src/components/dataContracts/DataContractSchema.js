import { Code, Button } from '@chakra-ui/react'
import { useState } from 'react'
import { CopyButton } from '../ui/Buttons'
import './DataContractSchema.scss'

function DataContractSchema ({ schema }) {
  const [fullSize, setFullSize] = useState(false)
  const parsedSchema = schema ? JSON.stringify(JSON.parse(schema), null, 2) : ''

  return (
    <div className={'DataContractSchema'}>
      <div className={'DataContractSchema__CodeContainer'}>
        <Code
          className={`DataContractSchema__Code ${fullSize ? 'DataContractSchema__Code--FullSize' : ''}`}
          borderRadius={'lg'}
          px={5}
          py={4}
        >
          {parsedSchema}
        </Code>

        <CopyButton className={'DataContractSchema__CopyButton'} text={parsedSchema}/>
      </div>

      <Button
        size={'sm'}
        onClick={() => setFullSize(state => !state)}
        className={'DataContractSchema__FullSizeButton'}
      >
        {fullSize ? 'Hide code' : 'Show full code'}
      </Button>
    </div>
  )
}

export default DataContractSchema
