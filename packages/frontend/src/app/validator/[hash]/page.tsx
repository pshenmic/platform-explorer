import type { Metadata } from 'next'
import Validator from './Validator'

interface ValidatorRouteProps {
  params: Promise<{ hash: string }>
}

export async function generateMetadata(props: ValidatorRouteProps): Promise<Metadata> {
  const params = await props.params
  return {
    title: 'Validator #' + params.hash + ' — Dash Platform Explorer',
    description:
      'Validator #' + params.hash + ' on dash platform. ProTxHash, Status, Proposed blocks',
    keywords: [
      'Dash',
      'platform',
      'explorer',
      'blockchain',
      'Transaction',
      'Hash',
      'Height',
      'Type',
      'Timestamp',
      'Data'
    ],
    applicationName: 'Dash Platform Explorer'
  }
}

async function ValidatorRoute(props: ValidatorRouteProps) {
  const params = await props.params
  return <Validator hash={params.hash} />
}

export default ValidatorRoute
