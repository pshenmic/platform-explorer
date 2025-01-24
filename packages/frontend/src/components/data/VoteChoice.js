import ValueContainer from '../ui/containers/ValueContainer'
import Identifier from './Identifier'
import { ValueCard } from '../cards'
import './VoteChoice.scss'

function transformTypeString (input) {
  if (typeof input !== 'string') return null
  return input?.trim()?.replace(/ /g, '_')?.toUpperCase()
}

function VoteChoice ({ choiceStr }) {
  if (typeof choiceStr !== 'string') return 'n/a'
  const [choice, parameter] = choiceStr.split(/[()]/)
  const type = transformTypeString(choice)
  const colorScheme = {
    TOWARDSIDENTITY: 'green',
    LOCK: 'red',
    ABSTAIN: 'orange'
  }

  const choiceClasses = {
    TOWARDSIDENTITY: 'VoteChoice--TowardsIdentity',
    LOCK: 'VoteChoice--Lock',
    ABSTAIN: 'VoteChoice--Abstain'
  }

  if (parameter) {
    return (
      <ValueContainer
        className={`VoteChoice ${choiceClasses?.[type] || ''}`}
        colorScheme={colorScheme?.[type] || 'grey'}
      >
        <span>{choice}:</span>
        <ValueCard
          link={`/identity/${parameter}`}
          className={'VoteChoice__Parameter'}
          colorScheme={colorScheme?.[type] || 'grey'}
        >
          <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
            {parameter}
          </Identifier>
        </ValueCard>
      </ValueContainer>
    )
  }

  return (
    <ValueContainer
      className={'VoteChoice'}
      colorScheme={colorScheme?.[type] || 'grey'}
      size={'sm'}
    >
      {choice}
    </ValueContainer>
  )
}

export default VoteChoice
