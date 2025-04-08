import ContestedResource from './ContestedResource'

export async function generateMetadata ({ params }) {
  return {
    title: 'Contested resource — Dash Platform Explorer',
    description: 'Contested resource on Dash Platform.',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'data contract', 'datacontract', 'Schema', 'Documents', 'Date of Creation', 'Revision', 'Transaction'],
    applicationName: 'Dash Platform Explorer'
  }
}

function DataContractRoute ({ params }) {
  return <ContestedResource identifier={params.identifier}/>
}

export default DataContractRoute
