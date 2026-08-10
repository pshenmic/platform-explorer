import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import type { ReactNode } from 'react'
import HeadingRenderer from './HeadingRenderer'
import './Markdown.scss'

interface CustomMarkdownProps {
  children?: string | null
}

export default function CustomMarkdown ({ children }: CustomMarkdownProps) {
  const components: Components = {
    h1: HeadingRenderer as Components['h1'],
    h2: HeadingRenderer as Components['h2'],
    h3: HeadingRenderer as Components['h3'],
    h4: HeadingRenderer as Components['h4'],
    h5: HeadingRenderer as Components['h5'],
    h6: HeadingRenderer as Components['h6'],
    table: ({ children: tableChildren, ...props }) => (
      <div className='Markdown__TableWrapper'>
        <table {...props}>{tableChildren}</table>
      </div>
    )
  }

  return (
    <Markdown
      className={'Markdown'}
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {children ?? ''}
    </Markdown>
  )
}

export {
  HeadingRenderer
}
