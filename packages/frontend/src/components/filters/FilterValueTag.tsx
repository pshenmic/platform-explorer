import type { ReactNode, HTMLAttributes } from 'react'
import type { WithClassName } from '../../types/common'
import type { FilterType, FilterStateValue, MultiSelectOption } from './types'
import './FilterValueTag.scss'

interface FilterValueTagProps extends WithClassName {
  value?: ReactNode
  type?: FilterType | string
  rawValue?: FilterStateValue
  options?: MultiSelectOption[] | null
  customRender?: ((value: FilterStateValue) => ReactNode) | null
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  modifierClass?: string
}

export const FilterValueTag = ({
  value,
  type,
  rawValue,
  options,
  customRender,
  className
}: FilterValueTagProps) => {
  if (customRender && rawValue !== undefined) {
    return <>{customRender(rawValue)}</>
  }

  const Container = ({ children, modifierClass, ...props }: ContainerProps) => (
    <div
      className={`FilterValueTag ${className || ''} ${modifierClass || ''}`}
      {...props}
    >
      {children}
    </div>
  )

  switch (type) {
    case 'multiselect':
      return (
        <Container modifierClass={'FilterValueTag--Multiselect'}>
           {Array.isArray(rawValue)
             ? rawValue.map((selectedValue) => {
               const option = options?.find((option) => option?.value === selectedValue)
               return option?.label || option?.title || option?.value
             })
             : null}
        </Container>
      )

    case 'range':
      if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        const { min, max } = rawValue as { min?: string | number | null, max?: string | number | null }

        if (min && max) {
          return <Container modifierClass={'FilterValueTag--Range'}>{`From ${min} to ${max}`}</Container>
        }
        if (min) {
          return <Container modifierClass={'FilterValueTag--Range'}>{`Min ${min}`}</Container>
        }
        if (max) {
          return <Container modifierClass={'FilterValueTag--Range'}>{`Max ${max}`}</Container>
        }
      }

      return <Container modifierClass={'FilterValueTag--Range'}>{value}</Container>

    case 'input':
      return <Container modifierClass={'FilterValueTag--Input'}>{value}</Container>

    default:
      return <Container>{value}</Container>
  }
}
