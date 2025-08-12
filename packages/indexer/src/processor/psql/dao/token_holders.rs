use crate::entities::identity_token::TokenHolder;
use crate::processor::psql::dao::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Base58;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn token_holder(
        &self,
        holder: Identifier,
        token_identifier: Identifier,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let token_id = self
            .get_token_id(token_identifier, sql_transaction)
            .await?
            .unwrap();

        let token_holder = self
            .get_token_holder(holder, token_id, sql_transaction)
            .await?;

        match token_holder {
            None => {
                let token_base58 = token_identifier.to_string(Base58);
                let holder_base58 = holder.to_string(Base58);

                let stmt = sql_transaction
                    .prepare_cached("INSERT INTO token_holders (token_id, holder) VALUES ($1, $2)")
                    .await?;

                sql_transaction
                    .query(&stmt, &[&token_id, &holder_base58])
                    .await?;

                println!("New Token Holder ({holder_base58}) added for token {token_base58})");
            }
            Some(holder) => {
                println!(
                    "Token Holder already exists ({}, {})",
                    holder.owner,
                    holder.token_id.to_string()
                );
            }
        };

        Ok(())
    }

    pub async fn get_token_id(
        &self,
        token_identifier: Identifier,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<i32>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached("SELECT id from tokens where identifier = $1 limit 1;")
            .await?;

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&token_identifier.to_string(Base58)])
            .await?;

        let row = rows.first();

        match row {
            None => Ok(None),
            Some(row) => Ok(Some(row.get(0))),
        }
    }

    pub async fn get_token_holder(
        &self,
        holder: Identifier,
        token_id: i32,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<TokenHolder>, PoolError> {
        let stmt = sql_transaction
            .prepare_cached(
                "select token_id, holder from token_holders where token_id = $1 and holder = $2 limit 1;",
            )
            .await?;

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&token_id, &holder.to_string(Base58)])
            .await?;

        match rows.first() {
            None => Ok(None),
            Some(row) => Ok(Some(TokenHolder::from(row.clone()))),
        }
    }
}
