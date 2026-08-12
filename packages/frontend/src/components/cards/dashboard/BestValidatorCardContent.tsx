import type { ComponentType, ReactNode } from 'react'
import type { EpochData } from '../../../types'
import { ValueCard } from '../index'
import IdentifierJs from '../../data/Identifier'
import './BestValidatorCardContent.scss'

const Identifier = IdentifierJs as ComponentType<{
  children?: ReactNode
  avatar?: boolean
  copyButton?: boolean
  styles?: string[]
  ellipsis?: boolean
}>

interface BestValidatorCardContentProps {
  epoch?: Pick<EpochData, 'bestValidator'> | null
}

export function BestValidatorCardContent ({ epoch }: BestValidatorCardContentProps) {
  return (
    <div className={'BestValidatorCardContent'}>
      {epoch?.bestValidator
        ? <ValueCard
            link={epoch.bestValidator ? `/validator/${epoch.bestValidator}` : undefined}
            className={'ValidatorsTotalCard__Value'}
          >
          <Identifier avatar={true} copyButton={true} styles={['highlight-both']}>
            {epoch.bestValidator}
          </Identifier>
        </ValueCard>
        : 'n/a'}
    </div>
  )
}
