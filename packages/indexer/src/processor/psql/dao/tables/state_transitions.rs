use base64::Engine;
use base64::engine::general_purpose;
use deadpool_postgres::PoolError;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use sha256::digest;
use crate::models::TransactionStatus;
use crate::processor::psql::PostgresDAO;

impl PostgresDAO {
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
}