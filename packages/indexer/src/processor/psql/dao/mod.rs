use std::env;
use std::time::SystemTime;
use deadpool_postgres::{Config, ManagerConfig, Pool, PoolError, RecyclingMethod, Runtime};
use deadpool_postgres::tokio_postgres::{NoTls, Row};
use sha256::{digest};
use crate::entities::document::Document;
use base64::{Engine as _, engine::{general_purpose}};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::{Base58};
use dpp::state_transition::batch_transition::batched_transition::token_transition::{TokenTransition, TokenTransitionV0Methods};
use dpp::state_transition::batch_transition::batched_transition::token_transition_action_type::TokenTransitionActionTypeGetter;
use dpp::state_transition::batch_transition::token_base_transition::token_base_transition_accessors::TokenBaseTransitionAccessors;
use dpp::state_transition::batch_transition::token_base_transition::v0::v0_methods::TokenBaseTransitionV0Methods;
use dpp::state_transition::batch_transition::token_mint_transition::v0::v0_methods::TokenMintTransitionV0Methods;
use dpp::state_transition::batch_transition::TokenMintTransition;
use dpp::voting::vote_choices::resource_vote_choice::ResourceVoteChoice;
use serde_json::{Map, Number, Value};
use crate::entities::block_header::BlockHeader;
use crate::entities::data_contract::DataContract;
use crate::entities::identity::Identity;
use crate::entities::masternode_vote::MasternodeVote;
use crate::entities::token_config::TokenConfig;
use crate::entities::transfer::Transfer;
use crate::entities::validator::Validator;
use crate::models::TransactionStatus;

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

    pub async fn create_state_transition(&self, block_hash: String, owner: Identifier, st_type: u32, index: u32, bytes: Vec<u8>, gas_used: u64, status: TransactionStatus, error: Option<String>) {
        let data = general_purpose::STANDARD.encode(&bytes);
        let hash = digest(bytes.clone()).to_uppercase();
        let st_type = st_type as i32;
        let index_i32 = index as i32;

        let status_str = match status {
            TransactionStatus::FAIL => "FAIL",
            TransactionStatus::SUCCESS => "SUCCESS"
        };

        let query = "INSERT INTO state_transitions(hash, owner, data, type, \
        index, block_hash, gas_used, status, error) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &hash,
            &owner.to_string(Base58),
            &data,
            &st_type,
            &index_i32,
            &block_hash,
            &(gas_used as i64),
            &status_str,
            &error,
        ]).await.unwrap();

        println!("Created ST with hash {} from block with hash {}, owner = {}", &hash, &block_hash, &owner.to_string(Base58));
    }

    pub async fn create_data_contract(&self, data_contract: DataContract, st_hash: Option<String>) {
        let id = data_contract.identifier;
        let name = data_contract.name;
        let owner = data_contract.owner;

        let schema = data_contract.schema;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        let version = data_contract.version as i32;
        let is_system = data_contract.is_system;

        let format_version = match data_contract.format_version {
            None => None,
            Some(version) => Some(version as i32)
        };

        let query = "INSERT INTO data_contracts(identifier, name, owner, schema, version, \
        state_transition_hash, is_system, format_version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &id.to_string(Base58),
            &name,
            &owner.to_string(Base58),
            &schema_decoded,
            &version,
            &st_hash,
            &is_system,
            &format_version
        ]).await.unwrap();

        println!("Created DataContract {} [{} version]", id.to_string(Base58), version);
    }

    pub async fn create_token(&self, token: TokenConfig) {

        let max_supply = match token.maxSupply {
            None => None,
            Some(supply) => Some(supply as i64),
        };

        let distribution_rules = serde_json::to_value(token.distribution_rules).unwrap();
        let manual_minting_rules = serde_json::to_value(token.manual_minting_rules).unwrap();
        let manual_burning_rules = serde_json::to_value(token.manual_burning_rules).unwrap();
        let freeze_rules = serde_json::to_value(token.freeze_rules).unwrap();
        let unfreeze_rules = serde_json::to_value(token.unfreeze_rules).unwrap();
        let destroy_frozen_funds_rules = serde_json::to_value(token.destroy_frozen_funds_rules).unwrap();
        let emergency_action_rules = serde_json::to_value(token.emergency_action_rules).unwrap();

        let data_contract = self
          .get_data_contract_by_identifier(token.data_contract_identifier)
          .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                          token.data_contract_identifier.to_string(Base58)));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let query = "INSERT INTO tokens(position, identifier, data_contract_id, maxSupply, baseSupply, keeps_history, \
        distribution_rules, manual_minting_rules, manual_burning_rules, freeze_rules, unfreeze_rules, destroy_frozen_funds_rules, \
        emergency_action_rules) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);";

        let client = self.connection_pool.get().await.unwrap();
        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &(token.position as i16),
            &(token.identifier.to_string(Base58)),
            &data_contract_id,
            &(max_supply),
            &(token.baseSupply as i64),
            &token.keeps_history,
            &distribution_rules,
            &manual_minting_rules,
            &manual_burning_rules,
            &freeze_rules,
            &unfreeze_rules,
            &destroy_frozen_funds_rules,
            &emergency_action_rules
        ]).await.unwrap();

        println!("Created Token from contract {} wit position {}", token.data_contract_identifier.to_string(Base58), token.position);
    }

    pub async fn create_document(&self, document: Document, st_hash: Option<String>) -> Result<(), PoolError> {
        let id = document.identifier;
        let revision = document.revision;
        let revision_i32 = revision as i32;
        let transition_type = document.transition_type as i64;
        let data = document.data;
        let prefunded_voting_balance: Option<Value> = document.prefunded_voting_balance
            .map(|prefunded_voting_balance| {
                let (index_name, credits) = prefunded_voting_balance;

                let mut map: Map<String, Value> = Map::new();
                map.insert(index_name, Value::Number(Number::from(credits)));

                return serde_json::to_value(map).unwrap();
            });

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

        let query = "INSERT INTO documents(identifier,document_type_name,transition_type,owner,revision,data,deleted,\
        state_transition_hash,data_contract_id,is_system,prefunded_voting_balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &id.to_string(Base58),
            &document.document_type_name,
            &transition_type,
            &owner.to_string(Base58),
            &revision_i32,
            &data,
            &document.deleted,
            &st_hash,
            &data_contract_id,
            &is_system,
            &prefunded_voting_balance
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

        println!("Created Identity {}", identifier);

        Ok(())
    }

    pub async fn create_identity_alias(&self, identity: Identity, alias: String, st_hash: String) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let query = "INSERT INTO identity_aliases(identity_identifier,alias,state_transition_hash) VALUES ($1, $2, $3);";

        let stmt = client.prepare_cached(query).await.unwrap();

        client.query(&stmt, &[
            &identity.identifier.to_string(Base58),
            &alias,
            &st_hash,
        ]).await.unwrap();

        println!("Created Identity Alias {} -> {} ({})", identity.identifier.to_string(Base58), alias, &st_hash);

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
        block_version,app_version,l1_locked_height,validator,app_hash FROM blocks where height = $1;").await.unwrap();

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

        let stmt = client.prepare_cached("SELECT id,name,owner,identifier,version,is_system \
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

    pub async fn get_document_by_identifier(&self, identifier: Identifier) -> Result<Option<Document>, PoolError> {
        let client = self.connection_pool.get().await?;

        let stmt = client.prepare_cached("SELECT documents.id, documents.identifier,\
        documents.document_type_name,documents.transition_type,data_contracts.identifier,documents.owner,documents.price,\
        documents.deleted,documents.revision,documents.is_system,documents.prefunded_voting_balance \
        FROM documents \
        LEFT JOIN data_contracts ON data_contracts.id = documents.data_contract_id \
        WHERE documents.identifier = $1 \
        ORDER by revision DESC \
        LIMIT 1;").await.unwrap();

        let rows: Vec<Row> = client.query(&stmt, &[
            &identifier.to_string(Base58)
        ]).await.unwrap();

        let documents: Vec<Document> = rows
            .into_iter()
            .map(|row| {
                row.into()
            }).collect::<Vec<Document>>();

        Ok(documents.first().cloned())
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
        timestamp, block_version, app_version, l1_locked_height, validator, app_hash) \
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING hash;").await.unwrap();

        let rows = client.query(&stmt, &[
            &block_header.hash,
            &block_header.height,
            &SystemTime::from(block_header.timestamp),
            &block_header.block_version,
            &block_header.app_version,
            &block_header.l1_locked_height,
            &block_header.proposer_pro_tx_hash,
            &block_header.app_hash
        ]).await.unwrap();

        let block_hash: String = rows[0].get(0);

        block_hash
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

    pub async fn create_masternode_vote(&self, masternode_vote: MasternodeVote, st_hash: String) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let choice = match masternode_vote.choice {
            ResourceVoteChoice::TowardsIdentity(_) => 0i16,
            ResourceVoteChoice::Abstain => 1i16,
            ResourceVoteChoice::Lock => 2i16
        };
        let index_values = masternode_vote.index_values;
        let index_values_value = serde_json::to_value(index_values).unwrap();
        let data_contract = self
            .get_data_contract_by_identifier(masternode_vote.data_contract_identifier)
            .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                            masternode_vote.data_contract_identifier.to_string(Base58)));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let stmt = client.prepare_cached("INSERT INTO masternode_votes(pro_tx_hash, \
        state_transition_hash, voter_identity_id, choice, towards_identity_identifier, \
        data_contract_id, document_type_name, index_name, index_values, power) \
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);")
            .await.unwrap();

        client.query(&stmt, &[
            &masternode_vote.pro_tx_hash,
            &st_hash,
            &masternode_vote.voter_identity.to_string(Base58),
            &choice,
            &masternode_vote.towards_identity_identifier.map(|identifier| {identifier.to_string(Base58)}),
            &data_contract_id,
            &masternode_vote.document_type_name,
            &masternode_vote.index_name,
            &index_values_value,
            &masternode_vote.power
        ]).await.unwrap();

         println!("Created Masternode Vote st hash {}", &st_hash);

        Ok(())
    }

    pub async fn set_data_contract_name(&self, data_contract: DataContract, name: String) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("UPDATE data_contracts set name = $1 \
        WHERE identifier = $2;").await.unwrap();

        client.query(&stmt, &[
            &name,
            &data_contract.identifier.to_string(Base58),
        ]).await.unwrap();

        println!("DataContract {} was verified with the name {}", &data_contract.identifier.to_string(Base58), &name);

        Ok(())
    }

    pub async fn update_document_price(&self, document: Document) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("UPDATE documents set \
        price = $1, \
        revision = $2 \
        WHERE identifier = $3;").await.unwrap();

        client.query(&stmt, &[
            &(document.price.unwrap() as i64),
            &(document.revision as i32),
            &document.identifier.to_string(Base58),
        ]).await.unwrap();

        println!("Updated price for a document {} to {}", &document.identifier.to_string(Base58), &document.price.unwrap());

        Ok(())
    }

    pub async fn assign_document(&self, document: Document, owner: Identifier) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("UPDATE documents set \
        owner = $1, \
        revision = $2 \
        WHERE identifier = $3;").await.unwrap();

        client.query(&stmt, &[
            &owner.to_string(Base58),
            &(document.revision as i32),
            &document.identifier.to_string(Base58),
        ]).await.unwrap();

        println!("Reassigned document {} to the {}", &document.identifier.to_string(Base58), &owner.to_string(Base58));

        Ok(())
    }

    pub async fn token_transition(&self, token_transition: TokenTransition, amount: Option<u64>, public_note: Option<String>, owner: Identifier, recipient: Option<Identifier>, st_hash: String) -> Result<(), PoolError> {
        let client = self.connection_pool.get().await.unwrap();

        let stmt = client.prepare_cached("INSERT INTO tokens_transitions \
          (owner, token_identifier, action, amount, public_note, token_contract_position, state_transition_hash, data_contract_id, recipient) \
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)").await.unwrap();

        let data_contract = self
          .get_data_contract_by_identifier(token_transition.base().data_contract_id())
          .await.unwrap().expect(&format!("Could not find DataContract with identifier {}",
                                          token_transition.base().data_contract_id().to_string(Base58)));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let token_position = token_transition.base().token_contract_position();

        let action = token_transition.action_type();

        let token_identifier = token_transition.token_id();

        client.query(&stmt, &[
            &owner.to_string(Base58),
            &token_identifier.to_string(Base58),
            &(action as i16),
            &(amount.unwrap() as i64),
            &public_note,
            &(token_position as i16),
            &st_hash,
            &data_contract_id,
            &recipient.unwrap().to_string(Base58)
        ]).await.unwrap();

        println!("Token transition from {}", &owner.to_string(Base58));

        Ok(())
    }
}
