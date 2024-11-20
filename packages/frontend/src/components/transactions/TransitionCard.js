import './TransitionCard.scss'
import { ValueCard } from '../cards'
import { Identifier, InfoLine } from '../data'

function TransitionCard ({ transition }) {
  return (
    <div className={'TransitionCard'}>
      <InfoLine
        title={'Type'}
        value={transition?.action}
        // loading={transition.loading}
        error={transition?.action === undefined}
      />
      <InfoLine
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
        title={'Revision'}
        value={transition?.revision}
        // loading={transition.loading}
        error={transition?.revision === undefined}
      />
    </div>
  )
}

export default TransitionCard
