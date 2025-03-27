import React from 'react'
import './FilterValueTag.scss'

export const FilterValueTag = ({ value, type, rawValue, options, customRender, className }) => {
  if (customRender) {
    return customRender(rawValue)
  }

  const Container = ({ children, modifierClass, ...props }) => (
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
           {rawValue.map((selectedValue) => {
             const option = options?.find((option) => option?.value === selectedValue)
             return option?.label || option?.title || option?.value
           })}
        </Container>
      )

    case 'range':
      if (typeof rawValue === 'object') {
        const { min, max } = rawValue

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
