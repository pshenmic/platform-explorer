use dpp::address_funds::PlatformAddress;
use dpp::dashcore::TxOut;
use dpp::state_transition::address_credit_withdrawal_transition::accessors::AddressCreditWithdrawalTransitionAccessorsV0;
use dpp::state_transition::address_credit_withdrawal_transition::AddressCreditWithdrawalTransition;
use dpp::state_transition::address_funding_from_asset_lock_transition::accessors::AddressFundingFromAssetLockTransitionAccessorsV0;
use dpp::state_transition::address_funding_from_asset_lock_transition::AddressFundingFromAssetLockTransition;
use dpp::state_transition::address_funds_transfer_transition::accessors::AddressFundsTransferTransitionAccessorsV0;
use dpp::state_transition::address_funds_transfer_transition::AddressFundsTransferTransition;
use dpp::state_transition::identity_create_from_addresses_transition::IdentityCreateFromAddressesTransition;
use dpp::state_transition::identity_credit_transfer_to_addresses_transition::accessors::IdentityCreditTransferToAddressesTransitionAccessorsV0;
use dpp::state_transition::identity_credit_transfer_to_addresses_transition::IdentityCreditTransferToAddressesTransition;
use dpp::state_transition::identity_topup_from_addresses_transition::accessors::IdentityTopUpFromAddressesTransitionAccessorsV0;
use dpp::state_transition::identity_topup_from_addresses_transition::IdentityTopUpFromAddressesTransition;
use dpp::state_transition::{StateTransitionLike, StateTransitionWitnessSigned};

#[derive(Clone)]
pub struct PlatformAddressTransition {
    pub sender: Option<PlatformAddress>,
    pub recipient: Option<PlatformAddress>,
    pub transition_hash: String,
    pub transition_type: i32,
    pub amount: u64,
}

impl PlatformAddressTransition {
    pub fn from_identity_credit_transfer_to_address_transition(
        transition: IdentityCreditTransferToAddressesTransition,
        transition_hash: String,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;
        transition
            .recipient_addresses()
            .iter()
            .map(|(addr, amount)| PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                recipient: Some(addr.clone()),
                sender: None,
                amount: amount.clone(),
            })
            .collect()
    }

    pub fn from_identity_create_from_address_transition(
        transition: IdentityCreateFromAddressesTransition,
        transition_hash: String,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;

        transition
            .inputs()
            .iter()
            .map(|(addr, (_, amount))| PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: Some(addr.clone()),
                recipient: None,
                amount: amount.clone(),
            })
            .collect()
    }

    pub fn from_identity_top_up_from_address_transition(
        transition: IdentityTopUpFromAddressesTransition,
        transition_hash: String,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;

        let inputs = transition.inputs();
        let output_address: Option<PlatformAddress> =
            transition.output().map(|(addr, _)| addr.clone());
        let output_amount: Option<u64> = transition.output().map(|(_, amount)| amount.clone());

        let mut address_transitions: Vec<PlatformAddressTransition> =
            Vec::with_capacity(inputs.len() + (output_address.is_some() as usize));

        address_transitions.extend(inputs.iter().map(|(addr, (_, amount))| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: Some(addr.clone()),
                recipient: None,
                amount: amount.clone(),
            }
        }));

        if let (Some(addr), Some(amount)) = (output_address, output_amount) {
            address_transitions.push(PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: None,
                recipient: Some(addr.clone()),
                amount: amount.clone(),
            })
        }

        address_transitions
    }

    pub fn from_address_funds_transfer(
        transition: AddressFundsTransferTransition,
        transition_hash: String,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;

        let inputs = transition.inputs();
        let outputs = transition.outputs();

        let mut address_transitions = Vec::with_capacity(inputs.len() + outputs.len());

        address_transitions.extend(inputs.iter().map(|(addr, (_, amount))| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: Some(addr.clone()),
                recipient: None,
                amount: amount.clone(),
            }
        }));

        address_transitions.extend(outputs.iter().map(|(addr, amount)| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: None,
                recipient: Some(addr.clone()),
                amount: amount.clone(),
            }
        }));

        address_transitions
    }

    pub fn from_address_funding_from_asset_lock(
        transition: AddressFundingFromAssetLockTransition,
        transition_hash: String,
        tx_out: TxOut,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;

        let inputs = transition.inputs();
        let outputs = transition.outputs();

        // duffs to credits
        let asset_lock_credits = tx_out.value * 1000;

        let inputs_amount: u64 = inputs.values().map(|(_, credits)| credits.clone()).sum();

        let total_in = asset_lock_credits + inputs_amount;

        let explicit_outputs_amount: u64 = outputs.values().flatten().sum();

        let remainder_amount = total_in - explicit_outputs_amount;

        let mut address_transitions = Vec::with_capacity(inputs.len() + outputs.len());

        address_transitions.extend(inputs.iter().map(|(addr, (_, amount))| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: Some(addr.clone()),
                recipient: None,
                amount: amount.clone(),
            }
        }));

        address_transitions.extend(outputs.iter().map(|(addr, amount_opt)| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: None,
                recipient: Some(addr.clone()),
                amount: amount_opt.unwrap_or(remainder_amount),
            }
        }));

        address_transitions
    }

    pub fn from_address_credit_withdrawal(
        transition: AddressCreditWithdrawalTransition,
        transition_hash: String,
    ) -> Vec<PlatformAddressTransition> {
        let transition_type: i32 = transition.state_transition_type() as _;

        let inputs = transition.inputs();
        let output = transition.output();

        let mut address_transitions = Vec::with_capacity(inputs.len() + output.is_some() as usize);

        address_transitions.extend(inputs.iter().map(|(addr, (_, amount))| {
            PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: Some(addr.clone()),
                recipient: None,
                amount: amount.clone(),
            }
        }));

        if let Some((addr, amount)) = output {
            address_transitions.push(PlatformAddressTransition {
                transition_type,
                transition_hash: transition_hash.clone(),
                sender: None,
                recipient: Some(addr.clone()),
                amount: amount.clone(),
            });
        }

        address_transitions
    }
}
