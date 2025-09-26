use crate::entities::masternode_vote::MasternodeVote;
use crate::processor::psql::PostgresDAO;
use deadpool_postgres::{PoolError, Transaction};
use dpp::platform_value::string_encoding::Encoding::Base58;
use dpp::voting::vote_choices::resource_vote_choice::ResourceVoteChoice;

impl PostgresDAO {
    pub async fn create_masternode_vote(
        &self,
        masternode_vote: MasternodeVote,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let choice = match masternode_vote.choice {
            ResourceVoteChoice::TowardsIdentity(_) => 0i16,
            ResourceVoteChoice::Abstain => 1i16,
            ResourceVoteChoice::Lock => 2i16,
        };
        let index_values = masternode_vote.index_values;
        let index_values_value = serde_json::to_value(index_values).unwrap();
        let data_contract = self
            .get_data_contract_by_identifier(
                masternode_vote.data_contract_identifier,
                sql_transaction,
            )
            .await
            .unwrap()
            .expect(&format!(
                "Could not find DataContract with identifier {}",
                masternode_vote.data_contract_identifier.to_string(Base58)
            ));
        let data_contract_id = data_contract.id.unwrap() as i32;

        let stmt = sql_transaction
            .prepare_cached(
                "INSERT INTO masternode_votes(pro_tx_hash, \
        state_transition_hash, voter_identity_id, choice, towards_identity_identifier, \
        data_contract_id, document_type_name, index_name, index_values, power) \
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);",
            )
            .await
            .unwrap();

        sql_transaction
            .execute(
                &stmt,
                &[
                    &masternode_vote.pro_tx_hash.to_lowercase(),
                    &st_hash.to_lowercase(),
                    &masternode_vote.voter_identity.to_string(Base58),
                    &choice,
                    &masternode_vote
                        .towards_identity_identifier
                        .map(|identifier| identifier.to_string(Base58)),
                    &data_contract_id,
                    &masternode_vote.document_type_name,
                    &masternode_vote.index_name,
                    &index_values_value,
                    &masternode_vote.power,
                ],
            )
            .await
            .unwrap();

        println!("Created Masternode Vote st hash {}", &st_hash);

        Ok(())
    }
}
