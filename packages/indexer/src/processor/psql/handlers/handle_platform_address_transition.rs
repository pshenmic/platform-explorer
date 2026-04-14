use crate::entities::platform_address_transition::PlatformAddressTransition;
use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::{PoolError, Transaction};

impl PSQLProcessor {
    pub async fn handle_platform_address_transitions(
        &self,
        transitions: Vec<PlatformAddressTransition>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        for transition in transitions {
            let sender_id: Option<i32> = match transition.sender {
                Some(sender) => Some(
                    self.dao
                        .create_platform_address(sender, sql_transaction)
                        .await?,
                ),
                None => None,
            };

            let recipient_id: Option<i32> = match transition.recipient {
                Some(recipient) => Some(
                    self.dao
                        .create_platform_address(recipient, sql_transaction)
                        .await?,
                ),
                None => None,
            };

            self.dao
                .create_platform_address_transition(
                    transition,
                    sender_id,
                    recipient_id,
                    sql_transaction,
                )
                .await?;
        }

        Ok(())
    }
}
