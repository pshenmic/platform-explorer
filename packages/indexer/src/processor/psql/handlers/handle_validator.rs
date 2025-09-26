use crate::entities::identity::{pro_tx_info_to_identities, Identity};
use crate::entities::validator::Validator;
use crate::processor::psql::{PSQLProcessor, ProcessorError};
use dashcore_rpc::RpcApi;
use deadpool_postgres::Transaction;
use dpp::dashcore::hashes::Hash;
use dpp::dashcore::ProTxHash;
use dpp::platform_value::string_encoding::encode;
use dpp::platform_value::string_encoding::Encoding::Hex;

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
                let pro_tx_hash = &ProTxHash::from_hex(validator.pro_tx_hash.as_str()).unwrap();

                let l1_tx = self
                    .dashcore_rpc
                    .get_raw_transaction_info(
                        &Hash::from_slice(&pro_tx_hash.to_byte_array().as_slice()).unwrap(),
                        None,
                    )
                    .unwrap();

                let pro_tx_info = self
                    .dashcore_rpc
                    .get_protx_info(pro_tx_hash, l1_tx.blockhash.as_ref())
                    .unwrap();

                let voting_identities = pro_tx_info_to_identities(pro_tx_info.clone());

                self.dao
                    .create_identity(Identity::from(validator.clone()), None, sql_transaction)
                    .await?;
                self.dao
                    .create_identity(voting_identities[0].clone(), None, sql_transaction)
                    .await?;
                self.dao
                    .create_identity(voting_identities[1].clone(), None, sql_transaction)
                    .await?;

                self.dao
                    .create_validator(
                        validator.clone(),
                        encode(&pro_tx_info.state.voting_address, Hex),
                        sql_transaction,
                    )
                    .await?;
                Ok(())
            }
            Some(_) => Ok(()),
        }
    }
}
