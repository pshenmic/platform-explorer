import React from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './data_contract.css'

export async function loader({params}) {
    const {identifier} = params
    return await Api.getDataContractByIdentifier(identifier);
}

function DataContractRoute() {
    const dataContract = useLoaderData()

    return (
        <div className="container">
            <div className={"data_contract_identifier"}>
                Identifier: {dataContract.identifier}
            </div>
            <div className={"data_contract_schema"}>
                {JSON.stringify(dataContract.schema, null, 2)}
            </div>
        </div>
    );
}

export default DataContractRoute;
