use crate::entities::identity::Identity;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::platform_value::string_encoding::Encoding::Base58;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn create_identity(
        &self,
        identity: Identity,
        st_hash: Option<String>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let tx_id = match st_hash.clone() {
            None => None,
            Some(hash) => Some(
                self.get_state_transition_id(hash, sql_transaction)
                    .await
                    .expect("Error getting state_transition_id"),
            ),
        };

        let identifier = identity.identifier;
        let revision = identity.revision;
        let revision_i32 = revision as i32;
        let owner = identity.owner;
        let is_system = identity.is_system;
        let identity_type = identity.identity_type.to_string();

        let query = "INSERT INTO identities( identifier, owner, revision,\
        state_transition_hash, is_system, state_transition_id, type\
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &identifier.to_string(Base58),
                    &owner.to_string(Base58),
                    &revision_i32,
                    &st_hash.map(|hash| hash.to_lowercase()),
                    &is_system,
                    &tx_id,
                    &identity_type,
                ],
            )
            .await
            .unwrap();

        println!("Created Identity {}", identifier);

        Ok(())
    }

    pub async fn create_identity_alias(
        &self,
        identity: Identity,
        alias: String,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let query = "INSERT INTO identity_aliases(identity_identifier,alias,state_transition_hash) VALUES ($1, $2, $3);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &identity.identifier.to_string(Base58),
                    &alias,
                    &st_hash.to_lowercase(),
                ],
            )
            .await
            .unwrap();

        println!(
            "Created Identity Alias {} -> {} ({})",
            identity.identifier.to_string(Base58),
            alias,
            &st_hash
        );

        Ok(())
    }

    pub async fn get_identity_by_identifier(
        &self,
        identifier: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<Identity>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT id, owner, identifier, revision, \
        is_system, type, id FROM identities where identifier = $1 LIMIT 1;",
            )
            .await
            .unwrap();

        let rows: Vec<Row> = sql_transaction.query(&stmt, &[&identifier]).await.unwrap();

        let identities: Vec<Identity> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<Identity>>();

        Ok(identities.first().cloned())
    }
}
