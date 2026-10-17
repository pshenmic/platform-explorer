use dpp::state_transition::identity_create_from_shielded_pool_transition::IdentityCreateFromShieldedPoolTransition;
use dpp::state_transition::identity_top_up_from_shielded_pool_transition::accessors::IdentityTopUpFromShieldedPoolTransitionAccessorsV0;
use dpp::state_transition::identity_top_up_from_shielded_pool_transition::IdentityTopUpFromShieldedPoolTransition;
use dpp::state_transition::shield_from_asset_lock_transition::accessors::ShieldFromAssetLockTransitionAccessorsV0;
use dpp::state_transition::shield_from_asset_lock_transition::ShieldFromAssetLockTransition;
use dpp::state_transition::shield_from_identity_transition::accessors::ShieldFromIdentityTransitionAccessorsV0;
use dpp::state_transition::shield_from_identity_transition::ShieldFromIdentityTransition;
use dpp::state_transition::shield_transition::ShieldTransition;
use dpp::state_transition::shielded_transfer_transition::ShieldedTransferTransition;
use dpp::state_transition::shielded_withdrawal_transition::ShieldedWithdrawalTransition;
use dpp::state_transition::token_purchase_from_shielded_pool_transition::accessors::TokenPurchaseFromShieldedPoolTransitionAccessorsV0;
use dpp::state_transition::token_purchase_from_shielded_pool_transition::TokenPurchaseFromShieldedPoolTransition;
use dpp::state_transition::token_shielded_transfer_with_shielded_fee_transition::accessors::TokenShieldedTransferWithShieldedFeeTransitionAccessorsV0;
use dpp::state_transition::token_shielded_transfer_with_shielded_fee_transition::TokenShieldedTransferWithShieldedFeeTransition;
use dpp::state_transition::token_unshield_with_shielded_fee_transition::accessors::TokenUnshieldWithShieldedFeeTransitionAccessorsV0;
use dpp::state_transition::token_unshield_with_shielded_fee_transition::TokenUnshieldWithShieldedFeeTransition;
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

        let amount = transition.value_balance();

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

    pub fn from_shield_from_identity_transition(
        transition: ShieldFromIdentityTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = transition.amount();

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_identity_top_up_from_shielded_pool_transition(
        transition: IdentityTopUpFromShieldedPoolTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = transition.top_up_amount();

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    // the token transitions paying their fee from the shielded pool only move credits
    // out of it by the fee bundle's value balance, token amounts live in the token's own pool
    pub fn from_token_shielded_transfer_with_shielded_fee_transition(
        transition: TokenShieldedTransferWithShieldedFeeTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = transition.credit_amount();

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_token_unshield_with_shielded_fee_transition(
        transition: TokenUnshieldWithShieldedFeeTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = transition.credit_amount();

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }

    pub fn from_token_purchase_from_shielded_pool_transition(
        transition: TokenPurchaseFromShieldedPoolTransition,
        transition_hash: String,
    ) -> ShieldedTransition {
        let transition_type: i32 = transition.state_transition_type() as _;

        let amount = transition.credit_amount();

        ShieldedTransition {
            transition_type,
            transition_hash,
            amount,
        }
    }
}
