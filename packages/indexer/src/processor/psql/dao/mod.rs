use std::env;
use std::time::SystemTime;
use deadpool_postgres::{Config, Manager, ManagerConfig, Pool, PoolError, RecyclingMethod, Runtime, tokio_postgres, Transaction};
use deadpool_postgres::tokio_postgres::{Error, IsolationLevel, NoTls, Row};
use dpp::platform_value::string_encoding::Encoding;
use dpp::state_transition::data_contract_create_transition::accessors::DataContractCreateTransitionAccessorsV0;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::{StateTransition, StateTransitionType};
use crate::models::{TDBlock, TDBlockHeader};
use sha256::{digest, try_digest};
use base64::{Engine as _, engine::{general_purpose}};
use chrono::{DateTime, Utc};
use crate::entities::block_header::BlockHeader;

pub struct PostgresDAO {
    connection_pool: Pool,
}

impl PostgresDAO {
    pub fn new() -> PostgresDAO {
        let mut cfg = Config::new();

        let postgres_host = env::var("POSTGRES_HOST").expect("You've not set the POSTGRES_HOST");
        let postgres_db = env::var("POSTGRES_DB").expect("You've not set the POSTGRES_DB");
        let postgres_user = env::var("POSTGRES_USER").expect("You've not set the POSTGRES_USER");
        let postgres_pass = env::var("POSTGRES_PASS").expect("You've not set the POSTGRES_HOST");

        cfg.host = Some(postgres_host);
        cfg.dbname = Some(postgres_db);
        cfg.user = Some(postgres_user);
        cfg.password = Some(postgres_pass);
        cfg.manager = Some(ManagerConfig { recycling_method: RecyclingMethod::Fast });

        let connection_pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap();

        return PostgresDAO { connection_pool };
    }

    pub async fn create_state_transition(&self, block_hash: String, st_type: i32, index:i32, bytes: Vec<u8>) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_uppercase();

        let query = "INSERT INTO state_transitions(hash, data, type, index, block_hash) VALUES ($1, $2, $3, $4, $5);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&hash, &data, &st_type, &index, &block_hash]).await.unwrap();
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

    pub async fn get_block_header_by_height(&self, block_height: i32) -> Result<Option<BlockHeader>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT hash,height,timestamp,block_version,app_version,l1_locked_height,chain FROM blocks where height = $1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[&block_height])
            .await.unwrap();

        let blocks: Vec<BlockHeader> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<BlockHeader>>();

        let block = blocks.first();

        return Ok(block.cloned());
    }

    pub async fn create_block(&self, block_header: BlockHeader) -> String {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO blocks(hash, height, timestamp, block_version, app_version, l1_locked_height, chain) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING hash;").await.unwrap();

        let rows = client.query(&stmt, &[&block_header.hash, &block_header.height, &SystemTime::from(block_header.timestamp), &block_header.block_version, &block_header.app_version, &block_header.l1_locked_height, &block_header.chain]).await.unwrap();

        let block_hash:String = rows[0].get(0);

        return block_hash;
    }
}

