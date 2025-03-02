use deadpool_postgres::PoolError;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use tokio_postgres::Row;
use crate::entities::data_contract::DataContract;
use crate::processor::psql::PostgresDAO;

impl PostgresDAO {
  pub async fn create_data_contract(&self, data_contract: DataContract, st_hash: Option<String>) {
    let id = data_contract.identifier;
    let name = data_contract.name;
    let owner = data_contract.owner;

    let schema = data_contract.schema;
    let schema_decoded = serde_json::to_value(schema).unwrap();

    let version = data_contract.version as i32;
    let is_system = data_contract.is_system;

    let query = "INSERT INTO data_contracts(identifier, name, owner, schema, version, \
        state_transition_hash, is_system) VALUES ($1, $2, $3, $4, $5, $6, $7);";

    let client = self.connection_pool.get().await.unwrap();
    let stmt = client.prepare_cached(query).await.unwrap();

    client.query(&stmt, &[
      &id.to_string(Base58),
      &name,
      &owner.to_string(Base58),
      &schema_decoded,
      &version,
      &st_hash,
      &is_system
    ]).await.unwrap();

    println!("Created DataContract {} [{} version]", id.to_string(Base58), version);
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
}