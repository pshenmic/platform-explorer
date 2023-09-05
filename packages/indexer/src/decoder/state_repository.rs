use async_trait::async_trait;
use dpp::dashcore::InstantLock;
use dpp::data_contract::DataContract;
use dpp::document::{Document, ExtendedDocument};
use dpp::document::document_transition::document_base_transition::JsonValue;
use dpp::identifier::Identifier;
use dpp::identity::{Identity, IdentityPublicKey, KeyID, TimestampMillis};
use dpp::prelude::Revision;
use dpp::ProtocolError;
use dpp::state_repository::{FetchTransactionResponse, StateRepositoryLike};
use dpp::state_transition::state_transition_execution_context::StateTransitionExecutionContext;
use anyhow::Result as AnyResult;

pub struct MockStateRepository {}
pub struct MyDataContract(DataContract);
pub struct MyDocument(Document);
pub struct MyExtendedDocument(ExtendedDocument);
pub struct MyIdentity(Identity);
pub struct MyTransactionResponse(FetchTransactionResponse);

impl TryInto<FetchTransactionResponse> for MyTransactionResponse {
    type Error = ProtocolError;

    fn try_into(self) -> std::result::Result<FetchTransactionResponse, Self::Error> {
        return Ok(FetchTransactionResponse {
            height: None,
            data: None,
        });
    }
}

impl TryInto<Identity> for MyIdentity {
    type Error = ProtocolError;

    fn try_into(self) -> std::result::Result<Identity, Self::Error> {
        return Ok(Identity {
            protocol_version: 0,
            id: Default::default(),
            public_keys: Default::default(),
            balance: 0,
            revision: 0,
            asset_lock_proof: None,
            metadata: None,
        });
    }
}

impl TryInto<ExtendedDocument> for MyExtendedDocument {
    type Error = ProtocolError;

    fn try_into(self) -> std::result::Result<ExtendedDocument, Self::Error> {
        return Ok(ExtendedDocument {
            protocol_version: 0,
            document_type_name: "".to_string(),
            data_contract_id: Default::default(),
            document: Default::default(),
            data_contract: Default::default(),
            metadata: None,
            entropy: Default::default(),
        });
    }
}

impl TryInto<Document> for MyDocument {
    type Error = ProtocolError;

    fn try_into(self) -> std::result::Result<Document, Self::Error> {
        return Ok(Document {
            id: Default::default(),
            owner_id: Default::default(),
            properties: Default::default(),
            revision: None,
            created_at: None,
            updated_at: None,
        });
    }
}

impl TryInto<DataContract> for MyDataContract {
    type Error = ProtocolError;

    fn try_into(self) -> std::result::Result<DataContract, Self::Error> {
        return Ok(DataContract {
            protocol_version: 0,
            id: Default::default(),
            schema: "".to_string(),
            version: 0,
            owner_id: Default::default(),
            document_types: Default::default(),
            metadata: None,
            config: Default::default(),
            documents: Default::default(),
            defs: None,
            entropy: Default::default(),
            binary_properties: Default::default(),
        });
    }
}

#[async_trait(? Send)]
impl StateRepositoryLike for MockStateRepository {
    type ConversionError = ProtocolError;
    type FetchDataContract = MyDataContract;
    type FetchDocument = MyDocument;
    type FetchExtendedDocument = MyExtendedDocument;
    type FetchIdentity = MyIdentity;
    type FetchTransaction = MyTransactionResponse;

    async fn fetch_data_contract<'a>(&self, data_contract_id: &Identifier, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Option<Self::FetchDataContract>> {
        return Ok(Option::from(MyDataContract {
            0: Default::default()
        }));
    }

    async fn create_data_contract<'a>(&self, data_contract: DataContract, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn update_data_contract<'a>(&self, data_contract: DataContract, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_documents<'a>(&self, contract_id: &Identifier, data_contract_type: &str, where_query: JsonValue, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Vec<Self::FetchDocument>> {
        let mut vec = Vec::new();

        vec.push(MyDocument { 0: Default::default() });

        return Ok(vec);
    }

    async fn fetch_extended_documents<'a>(&self, contract_id: &Identifier, data_contract_type: &str, where_query: JsonValue, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Vec<Self::FetchExtendedDocument>> {
        let mut vec = Vec::new();

        vec.push(MyExtendedDocument {
            0: Default::default()
        });

        return Ok(vec);
    }

    async fn create_document<'a>(&self, document: &ExtendedDocument, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn update_document<'a>(&self, document: &ExtendedDocument, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn remove_document<'a>(&self, data_contract: &DataContract, data_contract_type: &str, document_id: &Identifier, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_transaction<'a>(&self, id: &str, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Self::FetchTransaction> {
        return Ok(MyTransactionResponse {
            0: Default::default()
        });
    }

    async fn fetch_identity<'a>(&self, id: &Identifier, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Option<Self::FetchIdentity>> {
        return Ok(Option::from(MyIdentity {
            0: Default::default()
        }));
    }

    async fn create_identity<'a>(&self, identity: &Identity, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn add_keys_to_identity<'a>(&self, identity_id: &Identifier, keys: &[IdentityPublicKey], execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn disable_identity_keys<'a>(&self, identity_id: &Identifier, keys: &[KeyID], disable_at: TimestampMillis, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn update_identity_revision<'a>(&self, identity_id: &Identifier, revision: Revision, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_identity_balance<'a>(&self, identity_id: &Identifier, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Option<u64>> {
        return Ok(Option::from(0));
    }

    async fn fetch_identity_balance_with_debt<'a>(&self, identity_id: &Identifier, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<Option<i64>> {
        return Ok(Option::from(0));
    }

    async fn add_to_identity_balance<'a>(&self, identity_id: &Identifier, amount: u64, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn remove_from_identity_balance<'a>(&self, identity_id: &Identifier, amount: u64, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn add_to_system_credits<'a>(&self, amount: u64, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn remove_from_system_credits<'a>(&self, amount: u64, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_latest_platform_block_header(&self) -> AnyResult<Vec<u8>> {
        return Ok(Vec::new());
    }

    async fn verify_instant_lock<'a>(&self, instant_lock: &InstantLock, execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<bool> {
        return Ok(true);
    }

    async fn is_asset_lock_transaction_out_point_already_used<'a>(&self, out_point_buffer: &[u8], execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<bool> {
        return Ok(true);
    }

    async fn mark_asset_lock_transaction_out_point_as_used<'a>(&self, out_point_buffer: &[u8], execution_context: Option<&'a StateTransitionExecutionContext>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_sml_store<T>(&self) -> AnyResult<T> where T: for<'de> serde::Deserialize<'de> + 'static {
        todo!()
    }

    async fn is_in_the_valid_master_nodes_list(&self, out_point_buffer: [u8; 32]) -> AnyResult<bool> {
        return Ok(true);
    }

    async fn fetch_latest_withdrawal_transaction_index(&self) -> AnyResult<u64> {
        return Ok(0u64);
    }

    async fn fetch_latest_platform_core_chain_locked_height(&self) -> AnyResult<Option<u32>> {
        return Ok(Option::from(0u32));
    }

    async fn enqueue_withdrawal_transaction(&self, index: u64, transaction_bytes: Vec<u8>) -> AnyResult<()> {
        return Ok(());
    }

    async fn fetch_latest_platform_block_time(&self) -> AnyResult<u64> {
        return Ok(0);
    }

    async fn fetch_latest_platform_block_height(&self) -> AnyResult<u64> {
        return Ok(0);
    }
}
