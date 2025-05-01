use dashcore_rpc::RpcApi;
use dpp::dashcore::{Block, BlockHash};
use crate::processor::psql::PSQLProcessor;

impl PSQLProcessor {
    pub fn get_l1_block_hash(&self, height: i32) -> BlockHash {
        self.dashcore_rpc.get_block_hash(height as u32).unwrap()
    }

    pub fn get_l1_block(&self, hash: &BlockHash) -> Block {
        self.dashcore_rpc.get_block(hash).unwrap()
    }
}