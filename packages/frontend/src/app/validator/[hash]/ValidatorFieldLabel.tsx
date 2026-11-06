import { Tooltip } from '../../../components/ui/Tooltips'

export default function ValidatorFieldLabel({
  label,
  description
}: {
  label: string
  description: string
}) {
  return (
    <Tooltip className="ValidatorPage__Tooltip" content={description}>
      <span className="ValidatorPage__Help" tabIndex={0}>
        {label}
      </span>
    </Tooltip>
  )
}
