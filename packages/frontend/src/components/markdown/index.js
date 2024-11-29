import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import HeadingRenderer from './HeadingRenderer'
import './Markdown.scss'

export default function CustomMarkdown ({ children }) {
  return (
    <Markdown
      className={'Markdown'}
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      components={{
        h1: HeadingRenderer,
        h2: HeadingRenderer,
        h3: HeadingRenderer,
        h4: HeadingRenderer,
        h5: HeadingRenderer,
        h6: HeadingRenderer,
        table: ({ node, ...props }) => (
          <div className='Markdown__TableWrapper'>
            <table {...props} />
          </div>
        )
      }}
    >
      {children}
    </Markdown>
  )
}

export {
  HeadingRenderer
}
