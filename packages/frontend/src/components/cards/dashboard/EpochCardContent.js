import { EpochTooltip } from '../../ui/Tooltips'
import { InfoIcon } from '@chakra-ui/icons'
import { NotActive } from '../../data'
import EpochProgress from '../../networkStatus/EpochProgress'
import './EpochCardContent.scss'

export function EpochCardContent ({ status }) {
  return (
    <div className={'EpochCardContent'}>
      {typeof status?.epoch?.number === 'number'
        ? <EpochTooltip epoch={status.epoch}>
          <div className={'ValidatorsTotalCard__EpochNumber'}>
            #{status.epoch.number}
            <InfoIcon ml={2} color={'brand.light'} boxSize={4}/>
          </div>
        </EpochTooltip>
        : <NotActive />}
      {status?.epoch &&
        <EpochProgress epoch={status.epoch} className={'EpochCardContent__EpochProgress'}/>}
    </div>
  )
}
