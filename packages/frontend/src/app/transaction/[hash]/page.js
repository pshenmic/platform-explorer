import Transaction from'./Transaction'


export async function generateMetadata({ params }) {
    return {
        title: 'Transaction #' + params.hash + ' — Dash Platform Explorer',
        description: '',
        keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Transaction'],
        applicationName: 'Dash Platform Explorer'
    }
}

async function TransactionRoute({params}) {

    return <Transaction hash={params.hash}/>

}

export default TransactionRoute
