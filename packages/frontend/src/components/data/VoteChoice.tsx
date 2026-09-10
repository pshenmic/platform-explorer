import ValueContainer from '../ui/containers/ValueContainer'
import Identifier from './Identifier'
import { ValueCard } from '../cards'
import './VoteChoice.css'

function transformTypeString (input: unknown): string | null {
  if (typeof input !== 'string') return null
  return input?.trim()?.replace(/ /g, '_')?.toUpperCase()
}

type VoteColor = 'green' | 'red' | 'orange' | 'gray'

interface VoteChoiceProps {
  choiceStr?: string | null
}

function VoteChoice ({ choiceStr }: VoteChoiceProps) {
  if (typeof choiceStr !== 'string') return 'n/a'
  const [choice, parameter] = choiceStr.split(/[()]/)
  const type = transformTypeString(choice)
  const colorScheme: Record<string, VoteColor> = {
    TOWARDSIDENTITY: 'green',
    LOCK: 'red',
    ABSTAIN: 'orange'
  }

  const choiceClasses: Record<string, string> = {
    TOWARDSIDENTITY: 'VoteChoice--TowardsIdentity',
    LOCK: 'VoteChoice--Lock',
    ABSTAIN: 'VoteChoice--Abstain'
  }

  const resolvedColor: VoteColor = (type && colorScheme[type]) || 'gray'

  if (parameter) {
    return (
      <ValueContainer
        className={`VoteChoice ${type ? (choiceClasses?.[type] || '') : ''}`}
        colorScheme={resolvedColor}
      >
        <span>{choice}:</span>
        <ValueCard
          link={`/identity/${parameter}`}
          className={'VoteChoice__Parameter'}
          colorScheme={resolvedColor === 'green' ? 'green' : 'default'}
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
      colorScheme={resolvedColor}
      size={'sm'}
    >
      {choice}
    </ValueContainer>
  )
}

export default VoteChoice
