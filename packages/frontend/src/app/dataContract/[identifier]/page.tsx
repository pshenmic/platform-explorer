import DataContract from './DataContract'

interface PageParams {
  identifier: string
}

interface PageProps {
  params: PageParams
}

export async function generateMetadata ({ params }: PageProps) {
  return {
    title: 'Data Contract #' + params.identifier + ' — Dash Platform Explorer',
    description: 'Data Contract ' + params.identifier + 'on Dash Platform. The Schema, Documents, Date of Creation, Revision, Transaction.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contract', 'datacontract', 'Schema', 'Documents', 'Date of Creation', 'Revision', 'Transaction'],
    applicationName: 'Dash Platform Explorer'
  }
}

function DataContractRoute ({ params }: PageProps) {
  return <DataContract identifier={params.identifier}/>
}

export default DataContractRoute
