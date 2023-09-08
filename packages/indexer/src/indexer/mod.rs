use dpp::state_transition::StateTransition;
use crate::decoder::decoder::StateTransitionDecoder;
use base64::{Engine as _, engine::{general_purpose}};
use crate::models::{PlatformExplorerSearchResponse, PlatformExplorerStatusResponse};

pub struct Indexer {
    decoder: StateTransitionDecoder,
}

/**
Indexer is responsible for indexing platform chain data.
Indexer is responsible for indexing platform chain data.
It sync up with the network and sends incoming state transitions events to the lower level
 **/
impl Indexer {
    pub fn new() -> Indexer {
        let decoder = StateTransitionDecoder::new();

        return Indexer { decoder };
    }

    pub async fn start(&self) {
        self.init().await;

        println!("Indexer started");
    }

    async fn init(&self) {
        let resp = reqwest::get("https://platform-explorer-api.rd.dash.org/status")
            .await
            .unwrap()
            .json::<PlatformExplorerStatusResponse>()
            .await
            .unwrap();


        let blocks_count = resp.blocks_count.parse::<i32>().unwrap();
        println!("Latest platform block: {}", &blocks_count);

        for _i in 1..blocks_count {
            let url = format!("https://platform-explorer-api.rd.dash.org/search?query={}", _i);

            let resp = reqwest::get(url)
                .await
                .unwrap()
                .json::<PlatformExplorerSearchResponse>()
                .await
                .unwrap();

            let txs = resp.block.block.data.txs;
            let block_height = resp.block.block.header.height;

            if txs.len() == usize::try_from(0).unwrap() {
                println!("No platform transactions at block height {}", &block_height);
            }

            for tx_base_64 in txs.iter() {
                let bytes = general_purpose::STANDARD.decode(tx_base_64).unwrap();
                let st_result = self.decoder.decode(bytes).await;

                let st_type = match st_result {
                    Ok(st) => match st {
                        StateTransition::DataContractCreate(_) => "DataContractCreate",
                        StateTransition::DataContractUpdate(_) => "DataContractUpdate",
                        StateTransition::DocumentsBatch(_) => "DocumentsBatch",
                        StateTransition::IdentityCreate(_) => "IdentityCreate",
                        StateTransition::IdentityTopUp(_) => "IdentityTopUp",
                        StateTransition::IdentityCreditWithdrawal(_) => "DataContractCreate",
                        StateTransition::IdentityUpdate(_) => "IdentityUpdate",
                        StateTransition::IdentityCreditTransfer(_) => "IdentityCreditTransfer"
                    }
                    Err(e) => "UnknownStateTransition"
                };
                println!("{} happened at block height {}", &st_type, &block_height);
            }
        }
    }
}

