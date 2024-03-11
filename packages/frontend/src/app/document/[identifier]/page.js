import Document from './Document'


export async function generateMetadata({ params }) {
    return {
        title: 'Document #' + params.identifier + ' — Dash Platform Explorer',
        description: '',
        keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'document'],
        applicationName: 'Dash Platform Explorer'
    }
}

function DocumentRoute({ params }) {

    return <Document identifier={params.identifier}/>

}

export default DocumentRoute
