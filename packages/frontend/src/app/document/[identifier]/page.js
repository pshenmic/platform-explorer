import Document from './Document'

export async function generateMetadata ({ params }) {
  return {
    title: 'Document #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Document ' + params.identifier + ' on Dash Platform. The Data, Identifier, Revision.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'document', 'Data', 'Identifier', 'Revision'],
    applicationName: 'Dash Platform Explorer'
  }
}

function DocumentRoute ({ params }) {
  return <Document identifier={params.identifier}/>
}

export default DocumentRoute
