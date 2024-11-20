import './TransitionCard.scss'
import { ValueCard } from '../cards'
import { Identifier, InfoLine } from '../data'

function TransitionCard ({ transition }) {
  return (
    <div className={'TransitionCard'}>
      <div className={'InfoBlock InfoBlock--Gradient'}>
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Action'}
          title={'Action'}
          value={transition?.action}
          // loading={transition.loading}
          error={transition?.action === undefined}
        />
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--DataContract'}
          title={'Data Contract Identifier'}
          value={(
            <ValueCard link={`/dataContract/${transition.dataContractId}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition.dataContractId}
              </Identifier>
            </ValueCard>
          )}
          // loading={transition.loading}
          // error={transition.error}
        />
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Revision'}
          title={'Revision'}
          value={transition?.revision}
          // loading={transition.loading}
          error={transition?.revision === undefined}
        />
      </div>
    </div>
  )
}

export default TransitionCard
