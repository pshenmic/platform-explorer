import { Children, createElement } from 'react'

const flatten = (text, child) => {
  return typeof child === 'string'
    ? text + child
    : Children.toArray(child.props.children).reduce(flatten, text)
}

const HeadingRenderer = props => {
  const children = Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase().replace(/\W/g, '-')

  return createElement(props.node.tagName, { id: slug }, props.children)
}

export default HeadingRenderer
