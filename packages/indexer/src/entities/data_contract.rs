use std::collections::BTreeMap;
use std::time::SystemTime;
use chrono::{DateTime, Utc};
use dpp::data_contract::DocumentName;
use dpp::data_contract::serialized_version::DataContractInSerializationFormat;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding;
use dpp::platform_value::Value;
use dpp::state_transition::data_contract_create_transition::DataContractCreateTransition;
use dpp::state_transition::data_contract_update_transition::accessors::DataContractUpdateTransitionAccessorsV0;
use dpp::state_transition::data_contract_update_transition::DataContractUpdateTransition;
use dpp::state_transition::StateTransition;
use tokio_postgres::Row;

#[derive(Clone)]
pub struct DataContract {
    pub identifier: Identifier,
    pub schema: BTreeMap<DocumentName, Value>,
    pub version: u32,
}

impl From<DataContractCreateTransition> for DataContract {
    fn from(state_transition: DataContractCreateTransition) -> Self {

        match state_transition {
            DataContractCreateTransition::V0(data_contract_create_transition) => {
                let data_contract = data_contract_create_transition.data_contract;

                match data_contract {
                    DataContractInSerializationFormat::V0(data_contract) => {
                        let id = data_contract.id;
                        let version = data_contract.version;
                        let schema = data_contract.document_schemas;

                        return DataContract{ identifier: id, schema, version };
                    }
                }
            }
        }
    }
}

