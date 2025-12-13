use crate::entities::data_contract::DataContract;
use crate::entities::document::Document;
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
        let owner = data_contract.owner;

        let schema = data_contract.schema;
        let schema_decoded = serde_json::to_value(schema).unwrap();

        let version = data_contract.version as i32;
        let is_system = data_contract.is_system;

        let format_version = match data_contract.format_version {
            None => None,
            Some(version) => Some(version as i32),
        };

        let description = data_contract.description;
        let keywords = data_contract.keywords;

        let query = "INSERT INTO data_contracts(identifier, owner, schema, version, \
        state_transition_hash, is_system, format_version, description, keywords) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .query(
                &stmt,
                &[
                    &id.to_string(Base58),
                    &owner.to_string(Base58),
                    &schema_decoded,
                    &version,
                    &st_hash,
                    &is_system,
                    &format_version,
                    &description,
                    &keywords,
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
        name: String,
        document: Option<Document>,
        data_contract: DataContract,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let document_identifier = document.map(|doc| doc.identifier.to_string(Base58));
        let data_contract_identifier = data_contract.identifier.to_string(Base58);

        let query = "INSERT INTO data_contract_names(name, document_identifier, data_contract_identifier) VALUES ($1, $2, $3);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[&name, &document_identifier, &data_contract_identifier],
            )
            .await
            .unwrap();

        println!(
            "DataContract {} was verified with the name {} at document {}",
            &data_contract_identifier,
            &name,
            &document_identifier.unwrap_or("none".to_string())
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
                "SELECT id, owner, identifier, version, is_system \
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
