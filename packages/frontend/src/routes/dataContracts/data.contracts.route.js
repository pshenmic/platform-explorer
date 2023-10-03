import React, {useEffect, useState} from 'react';
import './data_contracts.css'
import * as Api from '../../util/Api'
import {Link} from "react-router-dom";

function DataContracts({dataContracts}) {
    return <div className={"data_contracts_list"}>
        {
            dataContracts.map((dataContract) =>
                <DataContract
                    key={dataContract.identifier}
                    dataContract={dataContract}/>)
        }
    </div>
}

function DataContract({dataContract}) {
    return <div className={"data_contracts_item"}>
        <Link to={`/dataContract/${dataContract.identifier}`}>{dataContract.identifier}</Link>
    </div>
}

function DataContractsRoute() {
    const [dataContracts, setDataContracts] = useState(null)
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        Api.getDataContracts()
            .then((dataContracts) => setDataContracts(dataContracts))
            .catch((err) => {
                setError(err)
            })
            .finally(() => setLoading(false))
    }, [])

    return (<div className="container">
        {error && <div>Error {error}</div>}
        {loading && <div>Loading data contracts from API</div>}
        {dataContracts && <DataContracts dataContracts={dataContracts}/>}
    </div>);
}

export default DataContractsRoute;
