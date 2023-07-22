import React, {useState, useEffect} from 'react';
import {Form, Link, useLoaderData} from "react-router-dom";
import * as Api from "../../util/Api";
import './blocks.css'

function Blocks({blocks}) {
    return blocks.blocks.map((block) =>
        <div className={"block_list_item"}>
            <span>Block </span>
            <Link to={`/block/${block.block_id.hash}`}>{block.block_id.hash}</Link>
            <span> ({block.block.header.height})</span>
        </div>
    )
}

export async function loader({params}) {
    const blocks = await Api.getBlocks();
    return {blocks};
}

function BlocksRoute() {
    const {blocks} = useLoaderData()
    return (
        <div className="container">
            <div className={"block_list"}>
                <Blocks blocks={blocks}/>
            </div>
        </div>
    );
}

export default BlocksRoute;
