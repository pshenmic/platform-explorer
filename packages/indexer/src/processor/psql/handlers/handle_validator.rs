use crate::entities::identity::Identity;
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};

impl PSQLProcessor {
  pub async fn handle_validator(&self, validator: Validator) -> Result<(), ProcessorError> {
    let existing = self.dao.get_validator_by_pro_tx_hash(validator.pro_tx_hash.clone()).await?;

    match existing {
      None => {
        self.dao.create_validator(validator.clone()).await?;
        self.dao.create_identity(Identity::from(validator), None).await?;
        Ok(())
      }
      Some(_) => Ok(())
    }
  }
}