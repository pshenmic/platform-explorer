use std::env;
use base64::Engine;
use base64::engine::general_purpose;
use data_contracts::SystemDataContract;
use dpp::identifier::Identifier;
use dpp::identity::state_transition::AssetLockProved;
use dpp::prelude::{AssetLockProof, Revision};
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;
use dashcore_rpc::{Auth, Client, RpcApi};
use dpp::dashcore::{Txid};
use dpp::platform_value::string_encoding::Encoding::{Base58, Base64};
use tokio_postgres::Row;
use crate::entities::validator::Validator;

#[derive(Clone)]
pub struct Identity {
    pub id: Option<u32>,
    pub identifier: Identifier,
    pub owner: Identifier,
    pub revision: Revision,
    pub balance: Option<u64>,
    pub is_system: bool,
}

impl From<IdentityCreateTransition> for Identity {
    fn from(state_transition: IdentityCreateTransition) -> Self {
        let asset_lock = state_transition.asset_lock_proof().clone();
        let asset_lock_output_index = asset_lock.output_index();

        let transaction = match asset_lock {
            AssetLockProof::Instant(instant_lock) => instant_lock.transaction,
            AssetLockProof::Chain(chain_lock) => {
                let tx_hash = chain_lock.out_point.txid.to_string();
                let block_height = chain_lock.core_chain_locked_height;

                let core_rpc_host: String = env::var("CORE_RPC_HOST").expect("You've not set the CORE_RPC_HOST").parse().expect("Failed to parse CORE_RPC_HOST env");
                let core_rpc_port: String = env::var("CORE_RPC_PORT").expect("You've not set the CORE_RPC_PORT").parse().expect("Failed to parse CORE_RPC_PORT env");
                let core_rpc_user: String = env::var("CORE_RPC_USER").expect("You've not set the CORE_RPC_USER").parse().expect("Failed to parse CORE_RPC_USER env");
                let core_rpc_password: String = env::var("CORE_RPC_PASSWORD").expect("You've not set the CORE_RPC_PASSWORD").parse().expect("Failed to parse CORE_RPC_PASSWORD env");

                let rpc = Client::new(&format!("{}:{}", core_rpc_host, &core_rpc_port),
                                      Auth::UserPass(core_rpc_user, core_rpc_password)).unwrap();

                let block_hash = rpc.get_block_hash(block_height).unwrap();
                let transaction = rpc.get_raw_transaction(&Txid::from_hex(&tx_hash).unwrap(), Some(&block_hash)).unwrap();

                transaction
            }
        };

        let outpoint = transaction.output.iter().nth(asset_lock_output_index as usize).expect("Could not find outpoint by index").clone();

        let credits = outpoint.value * 1000;

        return Identity {
            id: None,
            identifier: state_transition.identity_id(),
            owner: state_transition.owner_id(),
            balance: Some(credits),
            revision: Revision::from(0 as u64),
            is_system: false,
        };
    }
}

impl From<IdentityUpdateTransition> for Identity {
    fn from(state_transition: IdentityUpdateTransition) -> Self {
        let identifier = state_transition.identity_id();
        let owner = state_transition.owner_id();
        let revision = state_transition.revision();

        return Identity {
            id: None,
            identifier,
            owner,
            balance: None,
            revision,
            is_system: false,
        };
    }
}

impl From<SystemDataContract> for Identity {
    fn from(data_contract: SystemDataContract) -> Self {
        let platform_version = dpp::version::PLATFORM_VERSIONS.first().unwrap();
        let source = data_contract.source(platform_version).unwrap();
        let identifier = Identifier::from(source.owner_id_bytes);
        let owner = Identifier::from(source.owner_id_bytes);

        return Identity {
            id: None,
            identifier,
            owner,
            revision: 0,
            balance: None,
            is_system: true,
        };
    }
}

impl From<Row> for Identity {
    fn from(row: Row) -> Self {
        let id: i32 = row.get(0);
        let owner: String = row.get(1);
        let identifier: String = row.get(2);
        let revision: i32 = row.get(3);
        let is_system: bool = row.get(4);

        return Identity {
            id: Some(id as u32),
            owner: Identifier::from_string(&owner.trim(), Base58).unwrap(),
            revision: Revision::from(revision as u64),
            identifier: Identifier::from_string(&identifier.trim(), Base58).unwrap(),
            is_system,
            balance: None,
        };
    }
}
impl From<Validator> for Identity {
    fn from(validator: Validator) -> Self {
        let pro_tx_hash_buffer = hex::decode(&validator.pro_tx_hash).unwrap();
        let identifier_string = general_purpose::STANDARD.encode(pro_tx_hash_buffer);
        let identifier = Identifier::from_string(&identifier_string, Base64).unwrap();
        let revision = 0u64;
        let is_system: bool = false;

        return Identity {
            id: None,
            owner: identifier,
            revision,
            identifier,
            is_system,
            balance: None,
        };
    }
}

