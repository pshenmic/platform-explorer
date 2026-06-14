import { Alias, Identifier, TimeDelta } from '../../data'
import { BaseSearchItem, BaseSearchItemContent } from './BaseSearchItem'

export function TokenSearchItem ({ token, className, onClick }) {
  const tokenName = token?.localizations?.en?.singularForm || token?.name

  return (
    <BaseSearchItem
      href={`/token/${token?.identifier}`}
      className={`${className || ''}`}
      gridClassModifier={'Token'}
      onClick={onClick}
      data={token}
    >
      <BaseSearchItemContent
        mainContent={
          tokenName
            ? <Alias avatarSource={token?.identifier} ellipsis={true}>{tokenName}</Alias>
            : <Identifier avatar={true} ellipsis={true} styles={['highlight-both']}>{token?.identifier}</Identifier>
        }
        additionalContent={
          <Identifier avatar={!!token?.owner?.identifier} ellipsis={true}>{token?.owner?.identifier || '-'}</Identifier>
        }
        timestamp={<TimeDelta endDate={token?.timestamp}/>}
      />
    </BaseSearchItem>
  )
}
