use dpp::state_transition::identity_create_from_shielded_pool_transition::IdentityCreateFromShieldedPoolTransition;
use dpp::state_transition::shield_from_asset_lock_transition::ShieldFromAssetLockTransition;
use dpp::state_transition::shield_transition::ShieldTransition;
use dpp::state_transition::shielded_transfer_transition::ShieldedTransferTransition;
use dpp::state_transition::shielded_withdrawal_transition::ShieldedWithdrawalTransition;
use dpp::state_transition::unshield_transition::UnshieldTransition;
use dpp::state_transition::StateTransitionLike;

#[derive(Clone)]
pub struct ShieldedTransition {
    pub transition_hash: String,
    pub transition_type: i32,
    pub amount: u64,
}

impl ShieldedTransition {
    pub fn from_shield_transition(
        transition: ShieldTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            ShieldTransition::V0(v0) => v0.amount,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_shielded_transfer_transition(
        transition: ShieldedTransferTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            ShieldedTransferTransition::V0(v0) => v0.value_balance,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_unshield_transition(
        transition: UnshieldTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            UnshieldTransition::V0(v0) => v0.unshielding_amount,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_shield_from_asset_lock_transition(
        transition: ShieldFromAssetLockTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            ShieldFromAssetLockTransition::V0(v0) => v0.value_balance,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_shielded_withdrawal_transition(
        transition: ShieldedWithdrawalTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            ShieldedWithdrawalTransition::V0(v0) => v0.unshielding_amount,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_identity_create_from_shielded_pool_transition(
        transition: IdentityCreateFromShieldedPoolTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = match transition {
            IdentityCreateFromShieldedPoolTransition::V0(v0) => v0.denomination,
        };

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }
}