import FirstPlaceIcon from '../ui/icons/FirstPlaceIcon'
import SecondPlaceIcon from '../ui/icons/SecondPlaceIcon'
import ThirdPlaceIcon from '../ui/icons/ThirdPlaceIcon'

const placeIcons = {
  1: FirstPlaceIcon,
  2: SecondPlaceIcon,
  3: ThirdPlaceIcon
}

export default function RankMark({ place }: { place?: number | null }) {
  if (place == null) return null
  const PlaceIcon = placeIcons[place as keyof typeof placeIcons]
  return (
    <span className={'DataList__Rank'}>
      {PlaceIcon ? (
        <PlaceIcon className={'DataList__Medal'} aria-hidden={'true'} />
      ) : (
        <span className={'DataList__RankNum'} aria-hidden={'true'}>
          #{place}
        </span>
      )}
    </span>
  )
}

export function placeOf(index: number) {
  return index + 1
}

export function rankRowClassName(_item: unknown, index: number) {
  const place = placeOf(index)
  return place >= 1 && place <= 5 ? `DataList__Row--Rank${place}` : ''
}
