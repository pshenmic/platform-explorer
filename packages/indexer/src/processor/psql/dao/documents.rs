use crate::entities::document::Document;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use serde_json::{Map, Number, Value};
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn create_document(
        &self,
        document: Document,
        st_hash: Option<String>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let id = document.identifier;
        let revision = document.revision;
        let revision_i32 = revision as i32;
        let transition_type = document.transition_type as i64;
        let data = document.data;
        let prefunded_voting_balance: Option<Value> =
            document
                .prefunded_voting_balance
                .map(|prefunded_voting_balance| {
                    let (index_name, credits) = prefunded_voting_balance;

                    let mut map: Map<String, Value> = Map::new();
                    map.insert(index_name, Value::Number(Number::from(credits)));

                    return serde_json::to_value(map).unwrap();
                });

        let is_system = document.is_system;

        let owner: Identifier = match document.owner {
            None => {
                let state_transition_hash = st_hash
                    .clone()
                    .expect("State transition hash is not defined");
                let owner_identifier = self
                    .get_owner_by_state_transition_hash(
                        state_transition_hash.clone(),
                        sql_transaction,
                    )
                    .await
                    .unwrap()
                    .expect(&format!(
                        "Could not find owner for state transition {}",
                        state_transition_hash
                    ));

                Identifier::from_string(&owner_identifier.trim(), Base58).unwrap()
            }
            Some(_owner) => _owner,
        };

        let data_contract = self
            .get_data_contract_by_identifier(document.data_contract_identifier, sql_transaction)
            .await
            .unwrap()
            .expect(&format!(
                "Could not find DataContract with identifier {}",
                document.data_contract_identifier.to_string(Base58)
            ));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let query = "INSERT INTO documents(identifier,document_type_name,transition_type,owner,revision,data,deleted,\
        state_transition_hash,data_contract_id,is_system,prefunded_voting_balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &id.to_string(Base58),
                    &document.document_type_name,
                    &transition_type,
                    &owner.to_string(Base58),
                    &revision_i32,
                    &data,
                    &document.deleted,
                    &st_hash.map(|hash| hash.to_lowercase()),
                    &data_contract_id,
                    &is_system,
                    &prefunded_voting_balance,
                ],
            )
            .await
            .unwrap();

        println!(
            "Created document {} [{} revision] [is_deleted {}]",
            document.identifier.to_string(Base58),
            revision_i32,
            document.deleted
        );

        Ok(())
    }

    pub async fn get_document_by_identifier(
        &self,
        identifier: Identifier,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<Document>, PoolError> {
        let stmt = sql_transaction.prepare_cached("SELECT documents.id, documents.identifier,\
        documents.document_type_name,documents.transition_type,data_contracts.identifier,documents.owner,documents.price,\
        documents.deleted,documents.revision,documents.is_system,documents.prefunded_voting_balance \
        FROM documents \
        LEFT JOIN data_contracts ON data_contracts.id = documents.data_contract_id \
        WHERE documents.identifier = $1 \
        ORDER by revision DESC \
        LIMIT 1;").await.unwrap();

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&identifier.to_string(Base58)])
            .await
            .unwrap();

        let documents: Vec<Document> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<Document>>();

        Ok(documents.first().cloned())
    }
}
