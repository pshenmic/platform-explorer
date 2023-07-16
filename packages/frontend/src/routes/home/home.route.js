import React, {useState, useEffect} from 'react';
import * as Api from "../../util/Api";
import './home.css'
import {Link, useLoaderData} from "react-router-dom";

export async function loader({}) {
    const [status, transactions] = await Promise.all([Api.getStatus(), Api.getTransactions()])

    return {status, transactions}
}


function Transactions({transactions}) {
    return transactions.txs.map((tx) => <div className={"last_transactions_item"}>
        <Link to={`transaction/${tx.hash}`}>{tx.hash}</Link>
    </div>)
}

function HomeRoute() {
    const {status, transactions} = useLoaderData();

    const {tenderdashVersion, network, appVersion, p2pVersion, blockVersion, blocksCount} = status

    return (
        <div className="container">
            <div className="status">
                <div className="status_item">
                    <span>Network</span>
                    <span>{network}</span>
                </div>
                <div className="status_item">
                    <span>App Version</span>
                    <span>{appVersion}</span>
                </div>
                <div className="status_item">
                    <span>P2P version</span>
                    <span>{p2pVersion}</span>
                </div>
                <div className="status_item">
                    <span>Block version</span>
                    <span>{blockVersion}</span>
                </div>
                <div className="status_item">
                    <span>Tenderdash Version</span>
                    <span>{tenderdashVersion}</span>
                </div>
                <div className="status_item">
                    <span>Blocks</span>
                    <span>{blocksCount}</span>
                </div>
            </div>

            <div className="last_transactions">
                <span>Last transactions</span>
                <Transactions transactions={transactions}/>
            </div>
        </div>
    );
}

export default HomeRoute;
