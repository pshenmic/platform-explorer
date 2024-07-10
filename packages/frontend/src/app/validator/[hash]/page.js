import Validator from './Validator'

export function generateMetadata ({ params }) {
  return {
    title: 'Validator #' + params.hash + ' — Dash Platform Explorer',
    description: 'Validator #' + params.hash + ' on dash platform. ProTxHash, Status, Proposed blocks',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transaction', 'Hash', 'Height', 'Type', 'Timestamp', 'Data'],
    applicationName: 'Dash Platform Explorer'
  }
}

function ValidatorRoute ({ params }) {
  return <Validator hash={params.hash}/>
}

export default ValidatorRoute
