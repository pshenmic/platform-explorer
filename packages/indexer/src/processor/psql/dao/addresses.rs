use crate::entities::address_transition::AddressTransition;
use crate::processor::psql::dao::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::address_funds::PlatformAddress;
use tokio_postgres::Row;

impl PostgresDAO {
    pub async fn create_address(
        &self,
        address: PlatformAddress,
        sql_transaction: &Transaction<'_>,
    ) -> Result<i32, PoolError> {
        let address_id = self
            .get_address_id(address, sql_transaction)
            .await
            .expect("cannot get address id");

        if address_id.is_none() {
            let address_str = address.to_address_with_network(self.network).to_string();
            let address_bech32m_str = address.to_bech32m_string(self.network);

            let stmt = sql_transaction
                .prepare_cached(
                    "INSERT INTO addresses(address, bech32m_address) VALUES ($1, $2) RETURNING id;",
                )
                .await?;

            Ok(sql_transaction
                .query_one(&stmt, &[&address_str, &address_bech32m_str])
                .await?
                .get(0))
        } else {
            Ok(address_id.unwrap())
        }
    }

    pub async fn create_address_transition(
        &self,
        transition: AddressTransition,
        sender_id: Option<i32>,
        recipient_id: Option<i32>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let transition_id = self
            .get_state_transition_id(transition.transition_hash, sql_transaction)
            .await?;
        let transition_type = transition.transition_type;

        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO address_transitions(sender_id, recipient_id,\
            state_transition_id, transition_type) VALUES ($1, $2, $3, $4);",
            )
            .await?;

        sql_transaction
            .execute(
                &stmt,
                &[&sender_id, &recipient_id, &transition_id, &transition_type],
            )
            .await?;

        Ok(())
    }

    pub async fn get_address_id(
        &self,
        address: PlatformAddress,
        sql_transaction: &Transaction<'_>,
    ) -> Result<Option<i32>, PoolError> {
        let address_bech32m_str = address.to_bech32m_string(self.network);

        let stmt = sql_transaction
            .prepare_cached("SELECT id FROM addresses WHERE bech32m_address = $1 limit 1;")
            .await?;

        let rows: Vec<Row> = sql_transaction
            .query(&stmt, &[&address_bech32m_str])
            .await?;

        if rows.is_empty() {
            Ok(None)
        } else {
            let id = rows.first().unwrap().get(0);

            Ok(Some(id))
        }
    }
}
