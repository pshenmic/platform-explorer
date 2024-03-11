import Identity from "./Identity"


export async function generateMetadata({ params }) {
    return {
        title: 'Identity #' + params.identifier + ' — Dash Platform Explorer',
        description: '',
        keywords: ['Dash', 'platform', 'explorer', 'blockchain', 'Identity'],
        applicationName: 'Dash Platform Explorer'
    }
}

function IdentityRoute({ params }) {

    return <Identity identifier={params.identifier}/>

}

export default IdentityRoute;
