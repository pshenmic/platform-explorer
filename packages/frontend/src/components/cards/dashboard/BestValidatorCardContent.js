import { ValueCard } from '../index'
import { Identifier } from '../../data'
import './BestValidatorCardContent.scss'

export function BestValidatorCardContent ({ epoch }) {
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
