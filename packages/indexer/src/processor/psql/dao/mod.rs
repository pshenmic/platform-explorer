use std::env;
use std::time::SystemTime;
use deadpool_postgres::{Config, ManagerConfig, Pool, PoolError, RecyclingMethod, Runtime};
use deadpool_postgres::tokio_postgres::{NoTls, Row};
use sha256::{digest};
use crate::entities::document::Document;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::{Base58};
use crate::entities::block_header::BlockHeader;
use crate::entities::data_contract::DataContract;
use crate::entities::identity::Identity;
use crate::entities::transfer::Transfer;
use crate::entities::validator::Validator;

pub struct PostgresDAO {
    connection_pool: Pool,
}

impl PostgresDAO {
    pub fn new() -> PostgresDAO {
        let mut cfg = Config::new();

        let postgres_host = env::var("POSTGRES_HOST").expect("You've not set the POSTGRES_HOST");
        let postgres_db = env::var("POSTGRES_DB").expect("You've not set the POSTGRES_DB");
        let postgres_port: u16 = env::var("POSTGRES_PORT").expect("You've not set the POSTGRES_PORT").parse().expect("Failed to parse POSTGRES_PORT env");
        let postgres_user = env::var("POSTGRES_USER").expect("You've not set the POSTGRES_USER");
        let postgres_pass = env::var("POSTGRES_PASS").expect("You've not set the POSTGRES_PASS");

        cfg.host = Some(postgres_host);
        cfg.port = Some(postgres_port);
        cfg.dbname = Some(postgres_db);
        cfg.user = Some(postgres_user);
        cfg.password = Some(postgres_pass);
        cfg.manager = Some(ManagerConfig { recycling_method: RecyclingMethod::Fast });

        let connection_pool = cfg.create_pool(Some(Runtime::Tokio1), NoTls).unwrap();

        return PostgresDAO { connection_pool };
    }

    pub async fn create_state_transition(&self, block_hash: String, owner: Identifier, st_type: u32, index: u32, bytes: Vec<u8>) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_uppercase();
        let st_type = st_type as i32;
        let index_i32 = index as i32;

        let query = "INSERT INTO state_transitions(hash, owner, data, type, \
        index, block_hash) VALUES ($1, $2, $3, $4, $5, $6);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &hash,
            &owner.to_string(Base58),
            &data,
            &st_type,
            &index_i32,
            &block_hash
        ]).await.unwrap();

        println!("Created ST with hash {} from block with hash {}, owner = {}", &hash, &block_hash, &owner.to_string(Base58));
    }

    pub async fn create_data_contract(&self, data_contract: DataContract, st_hash: Option<String>) {
        let id = data_contract.identifier;
        let owner = data_contract.owner;

        let schema = data_contract.schema;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        let version = data_contract.version as i32;
        let is_system = data_contract.is_system;

        let query = "INSERT INTO data_contracts(identifier, owner, schema, version, \
        state_transition_hash, is_system) VALUES ($1, $2, $3, $4, $5, $6);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &id.to_string(Base58),
            &owner.to_string(Base58),
            &schema_decoded,
            &version,
            &st_hash,
            &is_system
        ]).await.unwrap();

        println!("Created DataContract {} [{} version]", id.to_string(Base58), version);
    }

    pub async fn create_document(&self, document: Document, st_hash: Option<String>) -> Result<(), PoolError> {
        let id = document.identifier;
        let revision = document.revision;
        let revision_i32 = revision as i32;

        let data = document.data;
        let is_system = document.is_system;

        let owner: Identifier = match document.owner {
            None => {
                let state_transition_hash = st_hash.clone().expect("State transition hash is not defined");
                let owner_identifier = self.get_owner_by_state_transition_hash(state_transition_hash.clone())
                    .await.unwrap().expect(&format!("Could not find owner for state transition {}",
                                                    state_transition_hash));

                Identifier::from_string(&owner_identifier.trim(), Base58).unwrap()
            },
            Some(_owner) => _owner
        };

        let client = self.connection_pool.get().await.unwrap();

        let data_contract = self
            .get_data_contract_by_identifier(document.data_contract_identifier)
            .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                            document.data_contract_identifier.to_string(Base58)));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let query = "INSERT INTO documents(identifier,owner,revision,data,deleted,\
        state_transition_hash,data_contract_id,is_system) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &id.to_string(Base58),
            &owner.to_string(Base58),
            &revision_i32,
            &data,
            &document.deleted,
            &st_hash,
            &data_contract_id,
            &is_system
        ]).await.unwrap();

        println!("Created document {} [{} revision] [is_deleted {}]",
                 document.identifier.to_string(Base58), revision_i32, document.deleted);

        Ok(())
    }

    pub async fn create_identity(&self, identity: Identity, st_hash: Option<String>) -> Result<(), PoolError> {
        let identifier = identity.identifier;
        let revision = identity.revision;
        let revision_i32 = revision as i32;
        let owner = identity.owner;
        let is_system = identity.is_system;

        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO identities(identifier,owner,revision,\
        state_transition_hash,is_system) VALUES ($1, $2, $3, $4, $5);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &identifier.to_string(Base58),
            &owner.to_string(Base58),
            &revision_i32,
            &st_hash,
            &is_system
        ]).await.unwrap();

        println!("Created Identity {}", identifier.to_string(Base58));

        Ok(())
    }

    pub async fn create_identity_alias(&self, identity: Identity, alias: String) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO identity_aliases(identity_identifier,alias) VALUES ($1, $2);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &identity.identifier.to_string(Base58),
            &alias,
        ]).await.unwrap();

        println!("Created Identity Alias {} -> {}", identity.identifier.to_string(Base58), alias);

        Ok(())
    }

    pub async fn create_transfer(&self, transfer: Transfer, st_hash: String) -> Result<(), PoolError> {
        let amount = transfer.amount as i64;

        let sender = transfer.sender.map(|t| { t.to_string(Base58)});
        let recipient = transfer.recipient.map(|t| { t.to_string(Base58)});

        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO transfers(amount,sender,recipient,\
        state_transition_hash) VALUES ($1, $2, $3, $4);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[&amount, &sender, &recipient, &st_hash]).await.unwrap();

        println!("Created Transfer on {}", &st_hash);

        Ok(())
    }

    pub async fn get_block_header_by_height(&self, block_height: i32) -> Result<Option<BlockHeader>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT hash,height,timestamp,\
        block_version,app_version,l1_locked_height,validator FROM blocks where height = $1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[
            &block_height
        ]).await.unwrap();

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

        let stmt = client.prepare_cached("SELECT id,owner,identifier,version,is_system \
        FROM data_contracts where identifier = $1 ORDER by version DESC LIMIT 1;")
            .await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[
            &identifier.to_string(Base58)
        ]).await.unwrap();

        let blocks: Vec<DataContract> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<DataContract>>();

        Ok(blocks.first().cloned())
    }

    pub async fn get_owner_by_state_transition_hash(&self, hash: String) -> Result<Option<String>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT owner FROM state_transitions \
        where hash = $1 LIMIT 1;").await.unwrap();

        let row = client.query_one(&stmt, &[
            &hash
        ]).await.unwrap();

        let owner: Option<String> = row.get(0);

        Ok(owner)
    }

    pub async fn create_block(&self, block_header: BlockHeader) -> String {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO blocks(hash, height, \
        timestamp, block_version, app_version, l1_locked_height, validator) \
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING hash;").await.unwrap();

        let rows = client.query(&stmt, &[
            &block_header.hash,
            &block_header.height,
            &SystemTime::from(block_header.timestamp),
            &block_header.block_version,
            &block_header.app_version,
            &block_header.l1_locked_height,
            &block_header.proposer_pro_tx_hash
        ]).await.unwrap();

        let block_hash: String = rows[0].get(0);

        return block_hash;
    }

    pub async fn get_validator_by_pro_tx_hash(&self, pro_tx_hash: String) -> Result<Option<Validator>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT pro_tx_hash \
        FROM validators where pro_tx_hash = $1 LIMIT 1;")
            .await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[
            &pro_tx_hash
        ]).await.unwrap();

        let validators: Vec<Validator> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<Validator>>();

        Ok(validators.first().cloned())
    }

    pub async fn get_identity_by_identifier(&self, identifier: String) -> Result<Option<Identity>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT id, owner, identifier, revision, \
        is_system FROM identities where identifier = $1 LIMIT 1;")
            .await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[
            &identifier
        ]).await.unwrap();

        let identities: Vec<Identity> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<Identity>>();

        Ok(identities.first().cloned())
    }


    pub async fn create_validator(&self, validator: Validator) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO validators(pro_tx_hash) \
        VALUES ($1);").await.unwrap();

        client.query(&stmt, &[
            &validator.pro_tx_hash,
        ]).await.unwrap();

        println!("Created Validator with proTxHash {}", &validator.pro_tx_hash);

        Ok(())
    }
}
