import React , {useState}from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import {Link} from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
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
    const {dataContract, documents} = useLoaderData();

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


                <Tabs 
                    selectedTabClassName="data_contract__tab--selected"
                    className='data_contract__info_tabs'
                    >

                    <TabList className='data_contract__tabs-container'>
                        <Tab className='data_contract__tab noselect'>Schema</Tab>
                        <Tab className='data_contract__tab noselect'>Documents</Tab>
                    </TabList>
                    <TabPanel>
                        <div className={'data_contract_schema'}>
                            <div className={'data_contract_schema__info'}>{JSON.stringify(dataContract.schema, null, 2)}</div>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className='documents_list'>
                            {documents.map((document, key) => 
                                <Link to={`/document/${document.identifier}`} key={key} 
                                    className='documents_list_item'>
                                    <span className='documents_list_item__identifier'>{document.identifier}</span>
                                </Link>
                            )}

                            {documents.length === 0 &&
                                <div className='documents_list__empty_message'>There are no documents created yet.</div>
                            }
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}

export default DataContractRoute;
