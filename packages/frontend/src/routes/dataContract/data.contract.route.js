import React, {useState} from 'react';
import {useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import {Link} from "react-router-dom";
import {Tab, Tabs, TabList, TabPanel} from 'react-tabs';
import ReactPaginate from "react-paginate";
import './data_contract.scss'
import './documents_list_item.scss'

const pagintationConfig = {
    itemsOnPage: {
        default: 25,
        values: [10, 25, 50, 75, 100]
    },
    defaultPage: 1
}

export async function loader({params}) {
    const {identifier} = params

    const [dataContract, documents] = await Promise.all([
        Api.getDataContractByIdentifier(identifier),
        Api.getDocumentsByDataContract(identifier, 
                                       pagintationConfig.defaultPage, 
                                       pagintationConfig.itemsOnPage.default + 1)
    ])

    return {
        dataContract,
        documents
    };
}

function DataContractRoute() {
    const {dataContract, documents} = useLoaderData();
    const [documentsList, setDocumentsList] = useState(documents.resultSet)
    const pageCount = Math.ceil(documents.pagination.total / pagintationConfig.itemsOnPage.default);

    const handlePageClick = async ({selected}) => {
        const {resultSet} = await Api.getDocumentsByDataContract(dataContract.identifier, 
                                                                 selected  + 1, 
                                                                 pagintationConfig.itemsOnPage.default + 1)
        setDocumentsList(resultSet);
    }

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
                            <div
                                className={'data_contract_schema__info'}>{JSON.stringify(dataContract.schema, null, 2)}</div>
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <div className='documents_list'>
                            {documentsList.map((document, key) =>
                                <Link to={`/document/${document.identifier}`} key={key}
                                      className='documents_list_item'>
                                    <span className='documents_list_item__identifier'>{document.identifier}</span>
                                </Link>
                            )}

                            {documents.length === 0 &&
                                <div className='documents_list__empty_message'>There are no documents created yet.</div>
                            }

                            <ReactPaginate
                                breakLabel="..."
                                nextLabel=">"
                                onPageChange={handlePageClick}
                                pageRangeDisplayed={2}
                                marginPagesDisplayed={1}
                                pageCount={pageCount}
                                previousLabel="<"
                                pageClassName="page-item"
                                pageLinkClassName="page-link"
                                previousClassName="page-item page-item--previous"
                                previousLinkClassName="page-link"
                                nextClassName="page-item page-item--next"
                                nextLinkClassName="page-link"
                                breakClassName="page-item  page-item--break-link"
                                containerClassName="pagination"
                                activeClassName="active"
                                renderOnZeroPageCount={true}
                            />
                        </div>
                    </TabPanel>
                </Tabs>
            </div>
        </div>
    );
}

export default DataContractRoute;
