use dpp::identifier::Identifier;
use dpp::state_transition::identity_credit_transfer_transition::accessors::IdentityCreditTransferTransitionAccessorsV0;
use dpp::state_transition::identity_credit_transfer_transition::IdentityCreditTransferTransition;
use dpp::state_transition::identity_credit_withdrawal_transition::accessors::IdentityCreditWithdrawalTransitionAccessorsV0;
use dpp::state_transition::identity_credit_withdrawal_transition::IdentityCreditWithdrawalTransition;
use dpp::state_transition::identity_topup_transition::accessors::IdentityTopUpTransitionAccessorsV0;
use dpp::state_transition::identity_topup_transition::IdentityTopUpTransition;

#[derive(Clone)]
pub struct Transfer {
    pub id: Option<u32>,
    pub sender: Option<Identifier>,
    pub recipient: Option<Identifier>,
    pub amount: u64,
}

impl From<IdentityTopUpTransition> for Transfer {
    fn from(state_transition: IdentityTopUpTransition) -> Self {
        let identifier = state_transition.identity_id().clone();
        let asset_lock = state_transition.asset_lock_proof().clone();
        let vout_index = asset_lock.instant_lock_output_index().unwrap();
        let tx_out = asset_lock
            .transaction()
            .unwrap().clone()
            .output.get(vout_index)
            .cloned().unwrap();
        let amount = tx_out.value * 1000;

        return Transfer {
            id: None,
            sender:None,
            recipient: Some(identifier),
            amount
        };
    }
}

impl From<IdentityCreditWithdrawalTransition> for Transfer {
    fn from(state_transition: IdentityCreditWithdrawalTransition) -> Self {
        let identifier = state_transition.identity_id().clone();
        let amount = state_transition.amount();

        return Transfer {
            id: None,
            sender: Some(identifier),
            recipient: None,
            amount
        };
    }
}

impl From<IdentityCreditTransferTransition> for Transfer {
    fn from(state_transition: IdentityCreditTransferTransition) -> Self {
        let sender = state_transition.identity_id().clone();
        let recipient = state_transition.recipient_id().clone();
        let amount = state_transition.amount();

        return Transfer {
            id: None,
            sender: Some(sender),
            recipient: Some(recipient),
            amount
        };
    }
}

