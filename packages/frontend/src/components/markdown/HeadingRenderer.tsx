import { Children, createElement } from 'react'
import type { ReactElement, ReactNode } from 'react'

const flatten = (text: string, child: ReactNode): string => {
  if (typeof child === 'string') return text + child
  if (child != null && typeof child === 'object' && 'props' in (child as ReactElement)) {
    const element = child as ReactElement<{ children?: ReactNode }>
    return Children.toArray(element.props.children).reduce(flatten, text)
  }
  return text
}

interface HeadingRendererProps {
  children?: ReactNode
  node?: {
    tagName?: string
  }
}

const HeadingRenderer = (props: HeadingRendererProps) => {
  const children = Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.toLowerCase().replace(/\W/g, '-')
  const tag = props.node?.tagName ?? 'h1'

  return createElement(tag, { id: slug }, props.children)
}

export default HeadingRenderer
