import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import path from 'path'
import Markdown from '../../components/markdown'
import './Api.css'

export const metadata: Metadata = {
  title: 'API — Dash Platform Explorer',
  description: '',
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

  return (
    <div className={'Api'}>
      <div className={'InfoBlock'}>
        <h1 className={'InfoBlock__Title'}>How to use Platform Explorer API</h1>
        <Markdown>{content}</Markdown>
      </div>
    </div>
  )
}

export default ApiRoute
