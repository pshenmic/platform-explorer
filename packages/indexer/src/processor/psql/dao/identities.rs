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
        let identifier = identity.identifier;
        let revision = identity.revision;
        let revision_i32 = revision as i32;
        let owner = identity.owner;
        let is_system = identity.is_system;

        let query = "INSERT INTO identities(identifier,owner,revision,\
        state_transition_hash,is_system) VALUES ($1, $2, $3, $4, $5);";

        let stmt = sql_transaction.prepare_cached(query).await.unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &identifier.to_string(Base58),
                    &owner.to_string(Base58),
                    &revision_i32,
                    &st_hash,
                    &is_system,
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
                &[&identity.identifier.to_string(Base58), &alias, &st_hash],
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
        is_system FROM identities where identifier = $1 LIMIT 1;",
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
