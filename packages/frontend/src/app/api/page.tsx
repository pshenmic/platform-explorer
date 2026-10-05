import type { Metadata } from 'next'
import { endpointMarkdown, readDocumentation } from './documentation'
import Markdown from '../../components/markdown'
import { Children, isValidElement, type ReactNode } from 'react'
import { ApiConnection, ApiEndpoint, ApiExample, ApiNavigation, ApiRequest } from './ApiControls'
import JsonHighlight from './JsonHighlight'
import './Api.css'

function plainText(children: ReactNode): string {
  return Children.toArray(children)
    .map(child =>
      isValidElement<{ children?: ReactNode }>(child)
        ? plainText(child.props.children)
        : String(child)
    )
    .join('')
}

function ApiCode({ text }: { text: string }) {
  const request = /^(GET|POST) (\/[^\s]+)[ \t]*\r?\n/.exec(text)
  if (!request)
    return (
      <ApiExample text={text} label="Response example">
        <JsonHighlight text={text} />
      </ApiExample>
    )
  const body = text
    .slice(request[0].length)
    .replace(/^Content-Type: application\/json\s*/, '')
    .trim()
  return <ApiRequest method={request[1]} path={request[2]} body={body} />
}

export const metadata: Metadata = {
  title: 'API — Dash Platform Explorer',
  description:
    'HTTP API reference for querying Dash Platform blocks, transactions, identities, and contracts.',
  keywords: [
    'Dash',
    'platform',
    'explorer',
    'blockchain',
    'block',
    'Timestamp',
    'Transactions',
    'Block'
  ],
  applicationName: 'Dash Platform Explorer'
}

async function ApiRoute() {
  const { introduction, sections } = await readDocumentation()
  const entries = sections.map(section => ({
    title: section.title,
    href: `#${section.id}`,
    path: section.path
  }))

  return (
    <div className={'Api'}>
      <div className="Api__Layout">
        <ApiNavigation entries={entries} />
        <div className="Api__Reference">
          <div className="Api__Introduction InfoBlock">
            <ApiConnection />
            <Markdown>{introduction}</Markdown>
          </div>
          {sections.map(section => (
            <ApiEndpoint
              key={section.id}
              id={section.id}
              title={section.title}
              method={section.method}
              path={section.path}
              markdown={endpointMarkdown(section)}
            >
              <Markdown
                components={{
                  pre: ({ children }) => <ApiCode text={plainText(children)} />,
                  h4: ({ children }) => <h4>{children}</h4>,
                  td: ({ children }) => {
                    const value = plainText(children)
                    return (
                      <td>
                        {/^[245]\d{2}$/.test(value) ? (
                          <span
                            className="ApiStatus"
                            data-kind={value.startsWith('2') ? 'success' : 'error'}
                          >
                            {children}
                          </span>
                        ) : (
                          children
                        )}
                      </td>
                    )
                  }
                }}
              >
                {section.body}
              </Markdown>
            </ApiEndpoint>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ApiRoute
