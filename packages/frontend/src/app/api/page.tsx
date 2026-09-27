import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import path from 'path'
import Markdown from '../../components/markdown'
import { ApiNavigation } from './ApiControls'
import './Api.css'

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
  // Server Component: load markdown as content data (no webpack raw-loader)
  const content = await readFile(path.join(process.cwd(), 'src/app/api/content.md'), 'utf8')

  const referenceStart = content.indexOf('Reference:')
  const referenceEnd = content.indexOf('### ', referenceStart)
  const entries = [
    ...content.slice(referenceStart, referenceEnd).matchAll(/\* \[([^\]]+)\]\((#[^)]+)\)/g)
  ].map(([, title, href]) => ({ title, href }))
  const body = content.slice(0, referenceStart) + content.slice(referenceEnd)

  return (
    <div className={'Api'}>
      <header className="Api__Header InfoBlock">
        <p className="Api__Eyebrow">Developers</p>
        <h1 className="Api__Title">Platform Explorer API</h1>
        <p className="Api__Description">
          Query Dash Platform blocks, transactions, identities, and contracts over HTTP.
        </p>
      </header>
      <div className="Api__Layout">
        <ApiNavigation entries={entries} />
        <div className="Api__Reference InfoBlock">
          <Markdown>{body}</Markdown>
        </div>
      </div>
    </div>
  )
}

export default ApiRoute
