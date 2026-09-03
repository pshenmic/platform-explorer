import type { Metadata } from 'next'
import Document from './Document'

interface DocumentRouteProps {
  params: Promise<{ identifier: string }>
}

export async function generateMetadata(props: DocumentRouteProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: 'Document #' + params.identifier + ' — Dash Platform Explorer',
    description:
      'Document ' + params.identifier + ' on Dash Platform. The Data, Identifier, Revision.',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'document',
      'Data',
      'Identifier',
      'Revision'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

async function DocumentRoute(props: DocumentRouteProps) {
  const params = await props.params
  return <Document identifier={params.identifier} />
}

export default DocumentRoute
