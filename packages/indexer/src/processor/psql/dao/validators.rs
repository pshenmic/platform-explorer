use crate::entities::identity::Identity;
use crate::entities::validator::Validator;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::platform_value::string_encoding::Encoding::Base58;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn get_validator_by_pro_tx_hash(
        &self,
        pro_tx_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<Validator>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "SELECT pro_tx_hash, id \
        FROM validators where pro_tx_hash = $1 LIMIT 1;",
            )
            .await
            .unwrap();

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&pro_tx_hash.to_lowercase()])
            .await
            .unwrap();

        let validators: Vec<Validator> = rows
            .into_iter()
            .map(|row| row.into())
            .collect::<Vec<Validator>>();

        Ok(validators.first().cloned())
    }

    pub async fn create_validator(
        &self,
        validator: Validator,
        owner_identity: Identity,
        voting_identity: Identity,
        voting_public_key_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let masternode_identity_id = self
            .get_identity_by_identifier(
                owner_identity.identifier.to_string(Base58),
                sql_transaction,
            )
            .await?
            .unwrap()
            .id
            .unwrap();

        let voting_identity_id = self
            .get_identity_by_identifier(
                voting_identity.identifier.to_string(Base58),
                sql_transaction,
            )
            .await?
            .unwrap()
            .id
            .unwrap();

        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO validators(pro_tx_hash, voting_identity_id, masternode_identity_id, voting_public_key_hash) \
        VALUES ($1, $2, $3, $4);",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &validator.pro_tx_hash.to_lowercase(),
                    &voting_identity_id,
                    &masternode_identity_id,
                    &voting_public_key_hash,
                ],
            )
            .await?;

        println!(
            "Created Validator with proTxHash {}",
            &validator.pro_tx_hash
        );

        Ok(())
    }
}
