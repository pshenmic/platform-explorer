use std::ops::Deref;
use std::sync::Arc;
use dpp::data_contract::state_transition::data_contract_create_transition::validation::state::validate_data_contract_create_transition_basic::DataContractCreateTransitionBasicValidator;
use dpp::data_contract::state_transition::data_contract_update_transition::validation::basic::DataContractUpdateTransitionBasicValidator;
use dpp::document::validation::basic::validate_documents_batch_transition_basic::DocumentBatchTransitionBasicValidator;
use dpp::identity::state_transition::asset_lock_proof::{AssetLockProofValidator, AssetLockTransactionValidator, ChainAssetLockProofStructureValidator, InstantAssetLockProofStructureValidator};
use dpp::identity::state_transition::identity_create_transition::validation::basic::IdentityCreateTransitionBasicValidator;
use dpp::identity::state_transition::identity_credit_withdrawal_transition::validation::basic::validate_identity_credit_withdrawal_transition_basic::IdentityCreditWithdrawalTransitionBasicValidator;
use dpp::identity::state_transition::identity_topup_transition::validation::basic::IdentityTopUpTransitionBasicValidator;
use dpp::identity::state_transition::identity_update_transition::validate_identity_update_transition_basic::ValidateIdentityUpdateTransitionBasic;
use dpp::identity::state_transition::validate_public_key_signatures::PublicKeysSignaturesValidator;
use dpp::identity::validation::PublicKeysValidator;
use dpp::state_transition::{StateTransition, StateTransitionFactory, StateTransitionFactoryOptions};
use dpp::state_transition::validation::validate_state_transition_basic::StateTransitionBasicValidator;
use dpp::state_transition::validation::validate_state_transition_by_type::StateTransitionByTypeValidator;
use dpp::version::ProtocolVersionValidator;
use crate::decoder::state_repository::MockStateRepository;
use dpp::{NativeBlsModule, ProtocolError};

pub struct StateTransitionDecoder {
    st_factory: StateTransitionFactory<MockStateRepository, NativeBlsModule>,
}

impl StateTransitionDecoder {
    pub async fn decode(&self, data: Vec<u8>) -> Result<StateTransition, ProtocolError> {
        let array = data.as_slice();

        let result = self.st_factory.create_from_buffer(array, Option::from(StateTransitionFactoryOptions{ skip_validation: true })).await;

        return result;
    }

    pub fn new() -> StateTransitionDecoder {
        let state_repository = MockStateRepository{};

        let state_repository_wrapper = Arc::new(state_repository);
        let protocol_version_validator = Arc::new(ProtocolVersionValidator::default());

        let adapter = NativeBlsModule{};

        let pk_validator =
            Arc::new(PublicKeysValidator::new(adapter.clone()).expect("Failed to create PublicKeysValidator"));
        let pk_sig_validator = Arc::new(PublicKeysSignaturesValidator::new(adapter.clone()));

        let asset_lock_tx_validator = Arc::new(AssetLockTransactionValidator::new(
            state_repository_wrapper.clone(),
        ));

        let asset_lock_validator = Arc::new(AssetLockProofValidator::new(
            InstantAssetLockProofStructureValidator::new(
                state_repository_wrapper.clone(),
                asset_lock_tx_validator.clone(),
            ).expect("Failed to create InstantAssetLockProofStructureValidator"),
            ChainAssetLockProofStructureValidator::new(
                state_repository_wrapper.clone(),
                asset_lock_tx_validator,
            ).expect("Failed to create ChainAssetLockProofStructureValidator"),
        ));

        let state_transition_basic_validator = StateTransitionBasicValidator::new(
            state_repository_wrapper.clone(),
            StateTransitionByTypeValidator::new(
                DataContractCreateTransitionBasicValidator::new(protocol_version_validator.clone()).expect("Failed to create DataContractCreateTransitionBasicValidator"),
                DataContractUpdateTransitionBasicValidator::new(
                    state_repository_wrapper.clone(),
                    protocol_version_validator.clone(),
                ).expect("Failed to DataContractUpdateTransitionBasicValidator"),
                IdentityCreateTransitionBasicValidator::new(
                    protocol_version_validator.deref().clone(),
                    pk_validator.clone(),
                    pk_validator.clone(),
                    asset_lock_validator.clone(),
                    adapter.clone(),
                    pk_sig_validator.clone(),
                ).expect("Failed to create IdentityCreateTransitionBasicValidator"),
                ValidateIdentityUpdateTransitionBasic::new(
                    ProtocolVersionValidator::default(),
                    pk_validator.clone(),
                    pk_sig_validator,
                ).expect("Failed to create IdentityUpdateValidator"),
                IdentityTopUpTransitionBasicValidator::new(
                    ProtocolVersionValidator::default(),
                    asset_lock_validator,
                ).expect("Failed to create IdentityTopUpValidator"),
                IdentityCreditWithdrawalTransitionBasicValidator::new(
                    protocol_version_validator.clone(),
                ).expect("Failed to create IdentityCreditWithdrawalValidator"),
                DocumentBatchTransitionBasicValidator::new(
                    state_repository_wrapper.clone(),
                    protocol_version_validator.clone(),
                ),
            ),
        );

        let factory = StateTransitionFactory::new(
            state_repository_wrapper,
            Arc::new(state_transition_basic_validator),
        );

        return StateTransitionDecoder { st_factory: factory };
    }
}
