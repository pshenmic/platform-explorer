use std::env;
use std::time::SystemTime;
use deadpool_postgres::{Config, ManagerConfig, Pool, PoolError, RecyclingMethod, Runtime};
use deadpool_postgres::tokio_postgres::{NoTls, Row};
use dpp::platform_value::string_encoding::Encoding;
use sha256::{digest};
use crate::entities::document::Document;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::{Base58};
use crate::entities::block_header::BlockHeader;
use crate::entities::data_contract::DataContract;
use crate::entities::identity::Identity;
use crate::entities::transfer::Transfer;

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

    pub async fn create_state_transition(&self, block_hash: String, st_type: u32, index: u32, bytes: Vec<u8>) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_uppercase();
        let st_type = st_type as i32;
        let index_i32 = index as i32;

        let query = "INSERT INTO state_transitions(hash, data, type, index, block_hash) VALUES ($1, $2, $3, $4, $5);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&hash, &data, &st_type, &index_i32, &block_hash]).await.unwrap();

        println!("Created ST with hash {} from block with hash {}", &hash, &block_hash);
    }

    pub async fn create_data_contract(&self, data_contract: DataContract, owner: Identifier, st_hash: String) {
        let id = data_contract.identifier;
        let id_str = id.to_string(Encoding::Base58);
        let owner_str = owner.to_string(Encoding::Base58);

        let schema = data_contract.schema;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        let version = data_contract.version as i32;

        let query = "INSERT INTO data_contracts(identifier, owner , schema, version, state_transition_hash) VALUES ($1, $2, $3, $4, $5);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        println!("{}", &owner_str.len());

        client.query(&stmt, &[&id_str, &owner_str, &schema_decoded, &version, &st_hash]).await.unwrap();

        println!("Created DataContract {} [{} version]", id_str, version);
    }

    pub async fn create_document(&self, document: Document, owner: Identifier, st_hash: String) -> Result<(), PoolError> {
        let id = document.identifier;
        let revision = document.revision;
        let revision_i32 = revision as i32;

        let data = document.data;

        let client = self.connection_pool.get().await.unwrap();

        let data_contract = self.get_data_contract_by_identifier(document.data_contract_identifier).await.unwrap().unwrap();
        let data_contract_id = data_contract.id.unwrap() as i32;

        let query = "INSERT INTO documents(identifier,owner,revision,data,deleted,state_transition_hash,data_contract_id) VALUES ($1, $2, $3, $4, $5, $6,$7);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&id.to_string(Encoding::Base58), &owner.to_string(Base58), &revision_i32, &data, &document.deleted, &st_hash, &data_contract_id]).await.unwrap();

        println!("Created document {} [{} revision] [is_deleted {}]", document.identifier.to_string(Base58), revision_i32, document.deleted);

        Ok(())
    }

    pub async fn create_identity(&self, identity: Identity, st_hash: String) -> Result<(), PoolError> {
        let identifier = identity.identifier;
        let revision = identity.revision;
        let revision_i32 = revision as i32;

        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO identities(identifier,revision,state_transition_hash) VALUES ($1, $2, $3);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&identifier.to_string(Encoding::Base58), &revision_i32, &st_hash]).await.unwrap();

        println!("Created Identity {}", identifier.to_string(Base58));

        Ok(())
    }

    pub async fn create_transfer(&self, transfer: Transfer, st_hash: String) -> Result<(), PoolError> {
        let amount = transfer.amount as i64;

        let sender = transfer.sender.map(|t| { t.to_string(Base58)});
        let recipient = transfer.recipient.map(|t| { t.to_string(Base58)});

        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO transfers(amount,sender,recipient,state_transition_hash) VALUES ($1, $2, $3, $4);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&amount, &sender, &recipient, &st_hash]).await.unwrap();

        println!("Created Transfer");

        Ok(())
    }

    pub async fn get_block_header_by_height(&self, block_height: i32) -> Result<Option<BlockHeader>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT hash,height,timestamp,block_version,app_version,l1_locked_height FROM blocks where height = $1;").await.unwrap();

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

    pub async fn get_data_contract_by_identifier(&self, identifier: Identifier) -> Result<Option<DataContract>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT id,owner,identifier,version FROM data_contracts where identifier = $1 ORDER by version DESC LIMIT 1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[&identifier.to_string(Encoding::Base58)])
            .await.unwrap();

        let blocks: Vec<DataContract> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<DataContract>>();

        Ok(blocks.first().cloned())
    }

    pub async fn get_document_by_identifier(&self, identifier: Identifier) -> Result<Option<Document>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT id,identifier,owner,revision,deleted FROM documents where identifier = $1 ORDER BY id DESC LIMIT 1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[&identifier.to_string(Encoding::Base58)])
            .await.unwrap();

        let blocks: Vec<Document> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<Document>>();

        Ok(blocks.first().cloned())
    }

    pub async fn create_block(&self, block_header: BlockHeader) -> String {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO blocks(hash, height, timestamp, block_version, app_version, l1_locked_height) VALUES ($1, $2, $3, $4, $5, $6) RETURNING hash;").await.unwrap();

        let rows = client.query(&stmt, &[&block_header.hash, &block_header.height, &SystemTime::from(block_header.timestamp), &block_header.block_version, &block_header.app_version, &block_header.l1_locked_height]).await.unwrap();

        let block_hash: String = rows[0].get(0);

        return block_hash;
    }
}
