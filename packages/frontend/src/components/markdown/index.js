import Markdown from 'react-markdown'
import HeadingRenderer from './HeadingRenderer'

export default function CustomMarkdown ({children}) {
    return (
        <Markdown 
            components={{
                h1: HeadingRenderer,
                h2: HeadingRenderer,
                h3: HeadingRenderer,
                h4: HeadingRenderer,
                h5: HeadingRenderer,
                h6: HeadingRenderer
            }}
        >
            {children}
        </Markdown>
    )
}

export {
    HeadingRenderer
}