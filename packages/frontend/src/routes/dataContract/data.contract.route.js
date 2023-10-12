import React , {useState}from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import {Link} from "react-router-dom";
import './data_contract.scss'
import './documents_list_item.scss'

export async function loader({params}) {
    const {identifier} = params
    
    return  {
       dataContract: await Api.getDataContractByIdentifier(identifier),
       documents: await Api.getDocumentsByDataContract(identifier)
    };
}

function DataContractRoute() {
    const dataContract = useLoaderData().dataContract
    const documents = useLoaderData().documents
    const [schemaVisibility, setSchemaVisibility] = useState(false)

    return (
        <div className="container">
            <div className='data_contract'>
                <div className={"data_contract_identifier"}>
                    <div className='data_contract_identifier__info_item'>
                        <span className={"data_contract_identifier__info_title"}>Identifier:</span>
                        <span className={"data_contract_identifier__info_value"}>{dataContract.identifier}</span>
                    </div>

                    <div className={'data_contract_identifier__info_item'}>
                        <span className={"data_contract_identifier__info_title"}>Version:</span>
                        <span className={"data_contract_identifier__info_value"}>{dataContract.version}</span>
                    </div>
                </div>

                <div className='data_contract__info_container'>
                    <div className={schemaVisibility ? 'data_contract_schema': 'data_contract_schema data_contract_schema--hidden'}>
                        <div className='data_contract_schema__head'>
                            <div className='data_contract_schema__title'>Schema</div>
                            <div className='data_contract_schema__hider'>
                                <span className={schemaVisibility ? 'data_contract_schema__hide_btn': 'data_contract_schema__hide_btn disabled'}
                                      onClick={()=>{setSchemaVisibility(false)}}>Hide</span>

                                <span className={!schemaVisibility ? 'data_contract_schema__show_btn': 'data_contract_schema__show_btn disabled'}
                                      onClick={()=>{setSchemaVisibility(true)}}>Show</span>
                            </div>
                        </div>
                        <div className={schemaVisibility ? 'data_contract_schema__info' : 'data_contract_schema__info disabled'}>{JSON.stringify(dataContract.schema, null, 2)}</div>
                    </div>
                    
                    <div className='documents_list'>
                        <div className='documents_list__title'>Documents</div>

                        {documents.map((document, key) => 
                            <Link to={`/document/${document.identifier}`} key={key} 
                                className='documents_list_item'>
                                <span className='documents_list_item__identifier'>{document.identifier}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DataContractRoute;
