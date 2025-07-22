use crate::entities::data_contract::DataContract;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn create_data_contract(
        &self,
        data_contract: DataContract,
        st_hash: Option<String>,
        sql_transaction: &Transaction<'_>,
    ) {
        let id = data_contract.identifier;
        let name = data_contract.name;
        let owner = data_contract.owner;

        let schema = data_contract.schema;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        let version = data_contract.version as i32;
        let is_system = data_contract.is_system;

        let format_version = match data_contract.format_version {
            None => None,
            Some(version) => Some(version as i32),
        };

        let query = "INSERT INTO data_contracts(identifier, name, owner, schema, version, \
        state_transition_hash, is_system, format_version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .query(
                &stmt,
                &[
                    &id.to_string(Base58),
                    &name,
                    &owner.to_string(Base58),
                    &schema_decoded,
                    &version,
                    &st_hash,
                    &is_system,
                    &format_version,
                ],
            )
            .await
            .unwrap();

        println!(
            "Created DataContract {} [{} version]",
            id.to_string(Base58),
            version
        );
    }

    pub async fn set_data_contract_name(
        &self,
        data_contract: DataContract,
        name: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "UPDATE data_contracts set name = $1 \
        WHERE identifier = $2;",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(&stmt, &[&name, &data_contract.identifier.to_string(Base58)])
            .await
            .unwrap();

        println!(
            "DataContract {} was verified with the name {}",
            &data_contract.identifier.to_string(Base58),
            &name
        );

        Ok(())
    }

    pub async fn create_data_contract_transition(
        &self,
        data_contract_id: u32,
        data_contract_identifier: Identifier,
        state_transition_id: Option<i32>,
        sql_transaction: &Transaction<'_>,
    ) {
        let query = "INSERT INTO data_contract_transitions(data_contract_id, data_contract_identifier, state_transition_id) \
        VALUES ($1, $2, $3);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .query(
                &stmt,
                &[
                    &(data_contract_id as i32),
                    &data_contract_identifier.to_string(Base58),
                    &(state_transition_id),
                ],
            )
            .await
            .unwrap();

        println!(
            "Created DataContract Transition for {}",
            data_contract_identifier.to_string(Base58),
        );
    }

    pub async fn get_data_contract_by_identifier(
        &self,
        identifier: Identifier,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<DataContract>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT id,name,owner,identifier,version,is_system \
        FROM data_contracts where identifier = $1 ORDER by version DESC LIMIT 1;",
            )
            .await
            .unwrap();

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&identifier.to_string(Base58)])
            .await
            .unwrap();

        let blocks: Vec<DataContract> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<DataContract>>();

        Ok(blocks.first().cloned())
    }
}
