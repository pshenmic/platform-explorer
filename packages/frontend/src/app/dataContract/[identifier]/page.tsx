import DataContract from './DataContract'

interface PageParams {
  identifier: string
}

interface PageProps {
  params: Promise<PageParams>
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params
  return {
    title: 'Data Contract #' + params.identifier + ' — Dash Platform Explorer',
    description:
      'Data Contract ' +
      params.identifier +
      'on Dash Platform. The Schema, Documents, Date of Creation, Revision, Transaction.',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'data contract',
      'datacontract',
      'Schema',
      'Documents',
      'Date of Creation',
      'Revision',
      'Transaction'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

async function DataContractRoute(props: PageProps) {
  const params = await props.params
  return <DataContract identifier={params.identifier} />
}

export default DataContractRoute
