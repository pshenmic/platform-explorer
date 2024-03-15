import Transaction from'./Transaction'


export function generateMetadata({ params }) {
    return {
        title: 'Transaction #' + params.hash + ' — Dash Platform Explorer',
        description: '',
        keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transaction'],
        applicationName: 'Dash Platform Explorer'
    }
}

function TransactionRoute({params}) {
    return <Transaction hash={params.hash}/>
}

export default TransactionRoute
