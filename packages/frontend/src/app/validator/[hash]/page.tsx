import type { Metadata } from 'next'
import Validator from './Validator'

interface ValidatorRouteProps {
  params: { hash: string }
}

export function generateMetadata ({ params }: ValidatorRouteProps): Metadata {
  return {
    title: 'Validator #' + params.hash + ' — Dash Platform Explorer',
    description: 'Validator #' + params.hash + ' on dash platform. ProTxHash, Status, Proposed blocks',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transaction', 'Hash', 'Height', 'Type', 'Timestamp', 'Data'],
    applicationName: 'Dash Platform Explorer'
  }
}

function ValidatorRoute ({ params }: ValidatorRouteProps) {
  return <Validator hash={params.hash}/>
}

export default ValidatorRoute
