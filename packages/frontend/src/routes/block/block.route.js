import React from 'react';
import {Form, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './block.css'

export async function loader({params}) {
    const {hash} = params
    const block = await Api.getBlockByHash(hash);
    return {block};
}

function BlockRoute() {
    const {block} = useLoaderData();

    return (
        <div className="container">
            <div className={"block_details"}>
                <div className={"block_details_item"}>
                    <span>Hash:</span>
                    <span>{block.block_id.hash}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>Height:</span>
                    <span>{block.block.header.height}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>State ID:</span>
                    <span>{block.block_id.state_id}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>Timestamp:</span>
                    <span>{block.block.header.time}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>Block Version:</span>
                    <span>{block.block.header.version.block}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>App Version:</span>
                    <span>{block.block.header.version.app}</span>
                </div>
                <div className={"block_details_item"}>
                    <span>L1 Locked Height:</span>
                    <span>{block.block.header.core_chain_locked_height}</span>
                </div>
            </div>
        </div>
    );
}

export default BlockRoute;
