import type { Metadata } from 'next'
import Document from './Document'

interface DocumentRouteProps {
  params: { identifier: string }
}

export async function generateMetadata ({ params }: DocumentRouteProps): Promise<Metadata> {
  return {
    title: 'Document #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Document ' + params.identifier + ' on Dash Platform. The Data, Identifier, Revision.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'document', 'Data', 'Identifier', 'Revision'],
    applicationName: 'Dash Platform Explorer'
  }
}

function DocumentRoute ({ params }: DocumentRouteProps) {
  return <Document identifier={params.identifier}/>
}

export default DocumentRoute
