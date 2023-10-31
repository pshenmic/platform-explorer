import DataContractsListItem from './DataContractsListItem'
import './DataContractsList.scss'


function DataContractsList ({dataContracts = [], size = 'l'}) {
    return (

        <div  className={'DataContractsList ' + 'DataContractsList--Size' + size.toUpperCase()}>

            {dataContracts.map((dataContract, key) =>
                <DataContractsListItem
                    key={key}
                    size={size}
                    dataContract={dataContract}
                />
            )}

            {dataContracts.length === 0 &&
                <div className={'DataContractsList__EmptyMessage'}>There are no data contracts created yet.</div>
            }

        </div>

    );
}

export default DataContractsList;