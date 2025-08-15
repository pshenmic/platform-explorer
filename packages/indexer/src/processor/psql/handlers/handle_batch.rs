use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::Transaction;
use dpp::identifier::Identifier;
use dpp::state_transition::batch_transition::batched_transition::BatchedTransition;
use dpp::state_transition::batch_transition::BatchTransitionV0;
use dpp::state_transition::StateTransitionLike;

impl PSQLProcessor {
    pub async fn handle_batch_v0(
        &self,
        state_transition: BatchTransitionV0,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        let transitions = state_transition.transitions.clone();

        for (_, document_transition) in transitions.iter().enumerate() {
            self.handle_document_transition(
                document_transition.clone(),
                state_transition.owner_id(),
                st_hash.clone(),
                sql_transaction,
            )
            .await
        }
    }

    pub async fn handle_batch_v1(
        &self,
        transitions: Vec<BatchedTransition>,
        owner_id: Identifier,
        st_hash: String,
        sql_transaction: &Transaction<'_>,
    ) -> () {
        for (_, token_transition) in transitions.iter().enumerate() {
            match token_transition {
                BatchedTransition::Token(transition) => {
                    self.handle_token_transition(
                        transition.clone(),
                        owner_id.clone(),
                        st_hash.clone(),
                        sql_transaction,
                    )
                    .await
                }
                BatchedTransition::Document(document_transition) => {
                    self.handle_document_transition(
                        document_transition.clone(),
                        owner_id,
                        st_hash.clone(),
                        sql_transaction,
                    )
                    .await
                }
            }
        }
    }
}
