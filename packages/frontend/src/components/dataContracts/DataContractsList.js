import DataContractsListItem from './DataContractsListItem'


function DataContractsList ({items = [], size = 'l'}) {
    return (

        <div className='DataContractsList'>

            {items.map((dataContract, key) =>
                <DataContractsListItem
                    key={key}
                    identifier={dataContract.identifier}
                    size={size}
                />
            )}

            {items.length === 0 &&
                <div className='DataContractsList__EmptyMessage'>There are no data contracts created yet.</div>
            }

        </div>

    );
}

export default DataContractsList;