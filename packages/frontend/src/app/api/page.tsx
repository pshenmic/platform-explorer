import type { Metadata } from 'next'
import { readFile } from 'fs/promises'
import path from 'path'
import Markdown from '../../components/markdown'
import './Api.css'

import { Container, Heading } from '@chakra-ui/react'

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
    <Container maxW={'container.lg'} color={'white'} mt={8} mb={8} className={'Api'}>
      <Container maxW={'container.lg'} _dark={{ color: 'white' }} className={'InfoBlock'}>
        <Heading className={'InfoBlock__Title'} as={'h1'}>
          How to use Platform Explorer API
        </Heading>
        <Markdown>{content}</Markdown>
      </Container>
    </Container>
  )
}

export default ApiRoute
