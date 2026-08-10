import type { ReactNode } from 'react'
import type { WithChildren, WithClassName } from '../../types/common'
import './FilterGroup.scss'

interface FilterGroupProps extends WithChildren, WithClassName {
  title?: ReactNode
}

export const FilterGroup = ({ title, children, className }: FilterGroupProps) => (
  <div className={`FilterGroup ${className || ''}`}>
    <div className={'FilterGroup__Title'}>{title}</div>
    <div className={'FilterGroup__Content'}>{children}</div>
  </div>
)
