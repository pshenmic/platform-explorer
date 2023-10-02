import React from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";

export async function loader({params}) {
    const {identifier} = params
    return await Api.getDataContractByIdentifier(identifier);
}

function DataContractRoute() {
    const dataContract = useLoaderData()
debugger
    return (
        <div className="container">
            <div className={""}>
                Identifier: {dataContract.identifier}
            </div>
        </div>
    );
}

export default DataContractRoute;
