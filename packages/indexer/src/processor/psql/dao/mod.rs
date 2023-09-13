use deadpool_postgres::{Config, Manager, ManagerConfig, Pool, RecyclingMethod, Runtime, tokio_postgres, Transaction};
use deadpool_postgres::tokio_postgres::{Error, IsolationLevel, NoTls, Row};
use dpp::platform_value::string_encoding::Encoding;
use dpp::state_transition::data_contract_create_transition::accessors::DataContractCreateTransitionAccessorsV0;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::{StateTransition, StateTransitionType};
use crate::models::{TDBlock, TDBlockHeader};
use sha256::{digest, try_digest};
use base64::{Engine as _, engine::{general_purpose}};

pub struct PostgresDAO {
    connection_pool: Pool,
}

impl PostgresDAO {
    pub fn new() -> PostgresDAO {
        let mut cfg = Config::new();

        cfg.host = Some("127.0.0.1".to_string());
        cfg.dbname = Some("indexer".to_string());
        cfg.user = Some("indexer".to_string());
        cfg.password = Some("indexer".to_string());
        cfg.manager = Some(ManagerConfig { recycling_method: RecyclingMethod::Fast });

        let connection_pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap();

        return PostgresDAO { connection_pool };
    }

    pub async fn create_state_transition(&self, block_id: i32, st_type: i32, bytes: Vec<u8>) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_uppercase();

        let query = "INSERT INTO state_transitions(hash, data, type, block_id) VALUES ($1, $2, $3, $4);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&hash, &data, &st_type, &block_id]).await.unwrap();
    }

    pub async fn create_data_contract(&self, state_transition: DataContractCreateTransition) {
        let id = state_transition.data_contract().id();
        let id_str = id.to_string(Encoding::Base58);

        let query = "INSERT INTO data_contracts(identifier) VALUES ($1);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();
        client.query(&stmt, &[&id_str]).await.unwrap();
    }

    pub async fn get_latest_block(&self) -> i32 {
        return 0;
    }

    pub async fn get_block_header_by_height(&self, block_height: i32) -> Option<TDBlockHeader> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("SELECT hash,block_height FROM blocks where block_height = $1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[&block_height])
            .await.unwrap();

        let blocks: Vec<TDBlockHeader> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<TDBlockHeader>>();

        let block = blocks.first();

        return block.cloned();
    }

    pub async fn create_block(&self, block_header: TDBlockHeader) -> i32 {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO blocks(block_height, hash) VALUES ($1, $2) RETURNING id;").await.unwrap();

        let rows = client.query(&stmt, &[&block_header.block_height, &block_header.hash]).await.unwrap();

        let block_id: i32 = rows[0].get(0);

        return block_id;
    }
}

impl From<Row> for TDBlockHeader {
    fn from(row: Row) -> Self {
        // id,hash,block_height
        let hash: String = row.get(0);
        let block_height: i32 = row.get(1);

        return TDBlockHeader { hash, block_height, tx_count: 0 };
    }
}
