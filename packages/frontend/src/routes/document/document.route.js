import React from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './document.scss'

export async function loader({params}) {
    const {identifier} = params

    return await Api.getDocumentByIdentifier(identifier);
}

function DocumentRoute() {
    const document = useLoaderData()
    const decumentData = document.data;

    console.log('document', document);


    return (
        <div className="container">

            <div className='document'>
            <div className='document__info_item'>
                    <div className='document__info_title'>Identifier:</div>
                    <div className='document__info_value'>{document.identifier}</div>
                </div>

                <div className='document__info_item'>
                    <div className='document__info_title'>Revision:</div>
                    <div className='document__info_value'>{document.revision}</div>
                </div>

                <div className='document__data_title'>Data:</div>
                <span className='document__data'>{JSON.stringify(document.data, null, 2)}</span>

            </div>

        </div>
    );
}

export default DocumentRoute;
