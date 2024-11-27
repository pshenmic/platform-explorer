import './TransitionCard.scss'
import { ValueCard } from '../cards'
import { Identifier, InfoLine } from '../data'
import DocumentActionBadge from './DocumentActionBadge'

function TransitionCard ({ transition }) {
  return (
    <div className={'TransitionCard'}>
      <div className={'InfoBlock InfoBlock--Gradient'}>
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Action'}
          title={'Action'}
          value={<DocumentActionBadge typeId={transition?.action}/>}
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
          error={!transition.dataContractId}
        />
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--DataContract'}
          title={'Document Identifier'}
          value={(
            <ValueCard link={`/document/${transition.id}`}>
              <Identifier avatar={true} copyButton={true} ellipsis={true} styles={['highlight-both']}>
                {transition.id}
              </Identifier>
            </ValueCard>
          )}
          error={!transition.id}
        />
        <InfoLine
          className={'TransitionCard__InfoLine TransitionCard__InfoLine--Revision'}
          title={'Revision'}
          value={transition?.revision}
          error={transition?.revision === undefined}
        />
      </div>
    </div>
  )
}

export default TransitionCard
