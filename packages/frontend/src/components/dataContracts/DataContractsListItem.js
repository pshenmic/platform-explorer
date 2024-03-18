import Link from 'next/link'
import './DataContractsListItem.scss'


function DataContractsListItem ({ dataContract }) {
    const {identifier, timestamp} = dataContract
    
    return (
        <Link 
            href={`/dataContract/${identifier}`} 
            className={'DataContractsListItem'}
        >
            <div className={'DataContractsListItem__Identifier'}>
                {identifier}
            </div>

            {(typeof timestamp === 'string') && 
                <div className={'DataContractsListItem__Timestamp'}>
                    {new Date(timestamp).toLocaleString()}
                </div>
            }
        </Link>
    );
}

export default DataContractsListItem;