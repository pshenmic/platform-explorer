import { ValueContainer } from '../ui/containers'
import { Identifier } from './index'

function VoteChoice ({ choiceStr }) {
  if (typeof choiceStr !== 'string') return 'n/a'

  const [choice, parameter] = choiceStr.split(/[()]/)

  if (parameter) {
    return (
      <ValueContainer>
        <span>{choice}</span>
        <ValueContainer>
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {parameter}
          </Identifier>
        </ValueContainer>
      </ValueContainer>
    )
  }

  return (
    <ValueContainer>
      {choice}
    </ValueContainer>
  )
}

export default VoteChoice
