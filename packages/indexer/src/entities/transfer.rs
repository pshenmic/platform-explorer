use dpp::identifier::Identifier;
use dpp::identity::state_transition::AssetLockProved;
use dpp::state_transition::identity_credit_transfer_transition::accessors::IdentityCreditTransferTransitionAccessorsV0;
use dpp::state_transition::identity_credit_transfer_transition::IdentityCreditTransferTransition;
use dpp::state_transition::identity_credit_withdrawal_transition::accessors::IdentityCreditWithdrawalTransitionAccessorsV0;
use dpp::state_transition::identity_credit_withdrawal_transition::IdentityCreditWithdrawalTransition;
use dpp::state_transition::identity_topup_transition::accessors::IdentityTopUpTransitionAccessorsV0;
use dpp::state_transition::identity_topup_transition::IdentityTopUpTransition;

#[derive(Clone)]
pub struct Transfer {
    pub sender: Option<Identifier>,
    pub recipient: Option<Identifier>,
    pub amount: u64,
}

impl From<IdentityTopUpTransition> for Transfer {
    fn from(state_transition: IdentityTopUpTransition) -> Self {
        let identifier = state_transition.identity_id().clone();
        let asset_lock = state_transition.asset_lock_proof().clone();
        let vout_index = asset_lock.output_index();

        let tx = asset_lock.transaction().cloned();

        // todo why assetlock transaction could not have tx?
        let amount = match tx {
            None => 0,
            Some(tx) => {
                let tx_out = tx.output.get(vout_index as usize).cloned().unwrap();

                tx_out.value * 1000
            }
        };

        return Transfer {
            sender: None,
            recipient: Some(identifier),
            amount,
        };
    }
}

impl From<IdentityCreditWithdrawalTransition> for Transfer {
    fn from(state_transition: IdentityCreditWithdrawalTransition) -> Self {
        let identifier = state_transition.identity_id().clone();
        let amount = state_transition.amount();

        return Transfer {
            sender: Some(identifier),
            recipient: None,
            amount,
        };
    }
}

impl From<IdentityCreditTransferTransition> for Transfer {
    fn from(state_transition: IdentityCreditTransferTransition) -> Self {
        let sender = state_transition.identity_id().clone();
        let recipient = state_transition.recipient_id().clone();
        let amount = state_transition.amount();

        return Transfer {
            sender: Some(sender),
            recipient: Some(recipient),
            amount,
        };
    }
}
