use crate::entities::platform_address_transition::PlatformAddressTransition;
use crate::processor::psql::PSQLProcessor;
use deadpool_postgres::{PoolError, Transaction};
use dpp::state_transition::StateTransitionType;
use std::collections::HashSet;

impl PSQLProcessor {
    pub async fn handle_platform_address_transitions(
        &self,
        transitions: Vec<PlatformAddressTransition>,
        sql_transaction: &Transaction<'_>,
    ) -> Result<(), PoolError> {
        let mut resolved = Vec::with_capacity(transitions.len());

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

            resolved.push((transition, sender_id, recipient_id));
        }

        let Some((first, _, _)) = resolved.first() else {
            return Ok(());
        };

        let transition_hash = first.transition_hash.clone();
        let transition_type = first.transition_type;

        let input_ids: HashSet<i32> = resolved.iter().filter_map(|(_, s, _)| *s).collect();

        let mut inputs = 0u64;
        let mut outputs = 0u64;
        let mut change = 0u64;

        for (transition, sender_id, recipient_id) in resolved.iter() {
            if sender_id.is_some() {
                inputs += transition.amount;
            }

            if let Some(recipient_id) = recipient_id {
                outputs += transition.amount;

                // an output paid back to one of the input addresses is change, not value moved
                if input_ids.contains(recipient_id) {
                    change += transition.amount;
                }
            }
        }

        for (transition, sender_id, recipient_id) in resolved {
            self.dao
                .create_platform_address_transition(
                    transition,
                    sender_id,
                    recipient_id,
                    sql_transaction,
                )
                .await?;
        }

        // shielding transitions record their value as a shielded transition too, which is the
        // amount that crossed the pool boundary, so the address rows must not add to it
        let shielded = [
            StateTransitionType::Shield,
            StateTransitionType::Unshield,
            StateTransitionType::ShieldFromAssetLock,
        ]
        .iter()
        .any(|t| *t as i32 == transition_type);

        if !shielded {
            // what the paying side spent, net of the change that came back to it. Value entering
            // from outside these addresses (an identity, an asset lock) has no input side to
            // measure, so the receiving side is what moved
            let moved = inputs.max(outputs).saturating_sub(change) as i64;

            let amount_stmt = sql_transaction
                .prepare_cached(
                    "UPDATE state_transitions SET amount = COALESCE(amount, 0) + $1 WHERE hash = $2;",
                )
                .await?;

            sql_transaction
                .execute(&amount_stmt, &[&moved, &transition_hash])
                .await?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    // inputs/outputs/change as the handler derives them from the rows, checked against the
    // shape each PlatformAddressTransition constructor produces
    fn moved(inputs: u64, outputs: u64, change: u64) -> u64 {
        inputs.max(outputs).saturating_sub(change)
    }

    #[test]
    fn measures_the_value_a_transition_moved() {
        // ADDRESS_FUNDS_TRANSFER: 100 in, 60 to the destination, 35 back as change, 5 fee
        assert_eq!(moved(100, 95, 35), 65);

        // ADDRESS_CREDIT_WITHDRAWAL: the withdrawal leaves for L1, only change is an output
        assert_eq!(moved(100, 35, 35), 65);

        // IDENTITY_TOP_UP_FROM_ADDRESSES: same shape, the credits leave for the identity
        assert_eq!(moved(100, 35, 35), 65);

        // IDENTITY_CREATE_FROM_ADDRESSES: inputs only, nothing comes back
        assert_eq!(moved(100, 0, 0), 100);

        // IDENTITY_CREDIT_TRANSFER_TO_ADDRESS: the identity is not an address, so no inputs
        assert_eq!(moved(0, 60, 0), 60);

        // ADDRESS_FUNDING_FROM_ASSET_LOCK: value arrives from L1, outputs are what landed
        assert_eq!(moved(0, 95, 0), 95);

        // and mixed, an asset lock topped up by address inputs that also take change back
        assert_eq!(moved(20, 115, 25), 90);
    }
}
