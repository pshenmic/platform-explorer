import { Alias } from '../../data'
import contestedResources from '../../../util/contestedResources'

export function ExpiringContestedResourceContent ({ contestedResource }) {
  console.log('contestedResource', contestedResource)

  console.log('contestedResource?.resourceValue', contestedResource?.resourceValue)
  console.log('contestedResources.getResourceValue', contestedResources.getResourceValue(contestedResource?.resourceValue))

  return (
    <div className={'ExpiringContestedResourceContent'}>
      <Alias>{contestedResources.getResourceValue(contestedResource?.resourceValue)}</Alias>
    </div>
  )
}
