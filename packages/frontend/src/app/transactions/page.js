import Transactions from "./Transactions";

export const metadata = {
    title: 'Transactions — Dash Platform Explorer',
    description: 'Identities on Dash Platform. The Identifier, Date of Creation',
    keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identities'],
    applicationName: 'Dash Platform Explorer'
}

function TransactionsRoute() {
    return <Transactions/>   
}

export default TransactionsRoute;
