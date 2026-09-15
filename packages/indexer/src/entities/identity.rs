use crate::entities::validator::Validator;
use crate::enums::identity_type::IdentityType;
use base64::engine::general_purpose;
use base64::Engine;
use dashcore_rpc::json::DMNState;
use data_contracts::SystemDataContract;
use dpp::dashcore::Transaction;
use dpp::identifier::Identifier;
use dpp::identity::state_transition::AssetLockProved;
use dpp::platform_value::string_encoding::Encoding::{Base58, Base64, Hex};
use dpp::prelude::Revision;
use dpp::state_transition::identity_create_transition::accessors::IdentityCreateTransitionAccessorsV0;
use dpp::state_transition::identity_create_transition::IdentityCreateTransition;
use dpp::state_transition::identity_update_transition::accessors::IdentityUpdateTransitionAccessorsV0;
use dpp::state_transition::identity_update_transition::IdentityUpdateTransition;
use dpp::state_transition::StateTransitionOwned;
use sha256::digest;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct Identity {
    pub identifier: Identifier,
    pub owner: Identifier,
    pub revision: Revision,
    pub balance: Option<u64>,
    pub is_system: bool,
    pub identity_type: IdentityType,
}

// The voting and operator identity ids are the sha256 of the ProTxHash concatenated with the
// voting address public key hash / the BLS operator key
fn masternode_key_identifiers(
    pro_tx_hash: &String,
    voting_address: &[u8; 20],
    pub_key_operator: &[u8],
) -> [Identifier; 2] {
    let pro_tx_hash_bytes = hex::decode(pro_tx_hash).unwrap();

    let derived = |key: &[u8]| {
        let mut bytes = pro_tx_hash_bytes.clone();
        bytes.extend_from_slice(key);

        Identifier::from_string(&digest(&bytes[..]), Hex).unwrap()
    };

    [derived(voting_address), derived(pub_key_operator)]
}

impl Identity {
    // Platform derives a voting and an operator identity for every masternode on top of the
    // owner one
    pub fn masternode_key_identities(pro_tx_hash: &String, state: &DMNState) -> Vec<Identity> {
        let [voting, operator] =
            masternode_key_identifiers(pro_tx_hash, &state.voting_address, &state.pub_key_operator);

        [
            (voting, IdentityType::MasternodeVoting),
            (operator, IdentityType::MasternodeOperator),
        ]
        .into_iter()
        .map(|(identifier, identity_type)| Identity {
            identifier,
            owner: identifier,
            revision: 0u64,
            balance: None,
            is_system: false,
            identity_type,
        })
        .collect()
    }
}

impl From<(IdentityCreateTransition, Transaction)> for Identity {
    fn from((state_transition, transaction): (IdentityCreateTransition, Transaction)) -> Self {
        let asset_lock = state_transition.asset_lock_proof().clone();
        let asset_lock_output_index = asset_lock.output_index();

        let outpoint = transaction
            .output
            .iter()
            .nth(asset_lock_output_index as usize)
            .expect("Could not find outpoint by index. Try to set asset lock output index")
            .clone();

        let credits = outpoint.value * 1000;

        Identity {
            identifier: state_transition.identity_id(),
            owner: state_transition.owner_id(),
            balance: Some(credits),
            revision: Revision::from(0 as u64),
            is_system: false,
            identity_type: IdentityType::Regular,
        }
    }
}

impl From<IdentityUpdateTransition> for Identity {
    fn from(state_transition: IdentityUpdateTransition) -> Self {
        let identifier = state_transition.identity_id();
        let owner = state_transition.owner_id();
        let revision = state_transition.revision();

        Identity {
            identifier,
            owner,
            balance: None,
            revision,
            is_system: false,
            identity_type: IdentityType::Regular,
        }
    }
}

impl From<SystemDataContract> for Identity {
    fn from(data_contract: SystemDataContract) -> Self {
        let platform_version = dpp::version::PLATFORM_VERSIONS.first().unwrap();
        let source = data_contract.source(platform_version).unwrap();
        let identifier = Identifier::from(source.owner_id_bytes);
        let owner = Identifier::from(source.owner_id_bytes);

        Identity {
            identifier,
            owner,
            revision: 0,
            balance: None,
            is_system: true,
            identity_type: IdentityType::Regular,
        }
    }
}

impl From<Row> for Identity {
    fn from(row: Row) -> Self {
        let owner: String = row.get(1);
        let identifier: String = row.get(2);
        let revision: i32 = row.get(3);
        let is_system: bool = row.get(4);

        Identity {
            owner: Identifier::from_string(&owner.trim(), Base58).unwrap(),
            revision: Revision::from(revision as u64),
            identifier: Identifier::from_string(&identifier.trim(), Base58).unwrap(),
            is_system,
            balance: None,
            identity_type: IdentityType::Regular,
        }
    }
}
impl From<Validator> for Identity {
    fn from(validator: Validator) -> Self {
        let pro_tx_hash_buffer = hex::decode(&validator.pro_tx_hash).unwrap();
        let identifier_string = general_purpose::STANDARD.encode(pro_tx_hash_buffer);
        let identifier = Identifier::from_string(&identifier_string, Base64).unwrap();
        let revision = 0u64;
        let is_system: bool = false;

        Identity {
            owner: identifier,
            revision,
            identifier,
            is_system,
            balance: None,
            identity_type: IdentityType::Masternode,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // the three identities of testnet masternode 51238bb9..., resolved on Platform itself
    #[test]
    fn derives_the_masternode_key_identities() {
        let pro_tx_hash =
            String::from("51238bb9e2b68fc822e8eb15d415e97ebc86f769a72c15e0a6e25d9ea8d38475");

        let voting_address =
            <[u8; 20]>::try_from(hex::decode("1341a33990289395b5659a4cb30cc07ba002b505").unwrap())
                .unwrap();

        let pub_key_operator = hex::decode(
            "ace65ce6933fbafc8686ea9e8ba72bc98f3d07905b4ccfb83162db440308e9255f708ce4f2623b27f9fc04fe11cf6057",
        )
        .unwrap();

        let identities =
            masternode_key_identifiers(&pro_tx_hash, &voting_address, &pub_key_operator);

        assert_eq!(
            identities[0].to_string(Base58),
            "9iRJJ6JcXkCJJrf877KJt2XVJEYqK29dfqfu4dQTPxs6"
        );
        assert_eq!(
            identities[1].to_string(Base58),
            "GgLgewAs4ThnT4ooVoTReGXxEBUmpDS2pi3vYkESDrvR"
        );
    }
}
