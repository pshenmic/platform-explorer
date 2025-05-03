use crate::entities::identity::Identity;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use deadpool_postgres::Transaction;

impl PSQLProcessor {
    pub async fn handle_validator(
        &self,
        validator: Validator,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), ProcessorError> {
        let existing = self
            .dao
            .get_validator_by_pro_tx_hash(validator.pro_tx_hash.clone(), sql_transaction)
            .await?;

        match existing {
            None => {
                self.dao
                    .create_validator(validator.clone(), sql_transaction)
                    .await?;
                self.dao
                    .create_identity(Identity::from(validator), None, sql_transaction)
                    .await?;
                Ok(())
            }
            Some(_) => Ok(()),
        }
    }
}
