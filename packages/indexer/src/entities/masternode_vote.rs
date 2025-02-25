use std::env;
use dashcore_rpc::{Auth, Client, RpcApi};
use dashcore_rpc::dashcore::{ProTxHash};
use dpp::dashcore::Txid;
use dpp::identifier::Identifier;
use dpp::platform_value::string_encoding::Encoding::Hex;
use dpp::platform_value::Value;
use dpp::state_transition::masternode_vote_transition::accessors::MasternodeVoteTransitionAccessorsV0;
use dpp::state_transition::masternode_vote_transition::MasternodeVoteTransition;
use dpp::voting::vote_choices::resource_vote_choice::ResourceVoteChoice;
use dpp::voting::vote_polls::VotePoll;
use dpp::voting::votes::resource_vote::ResourceVote;
use dpp::voting::votes::Vote;

#[derive(Clone)]
pub struct MasternodeVote {
    pub id: Option<u32>,
    pub power: i16,
    pub identifier: Identifier,
    pub pro_tx_hash: String,
    pub voter_identity: Identifier,
    pub choice: ResourceVoteChoice,
    pub data_contract_identifier: Identifier,
    pub towards_identity_identifier: Option<Identifier>,
    pub document_type_name: String,
    pub index_name: String,
    pub index_values: Vec<Value>
}


struct VoteInfo {
    pub choice: ResourceVoteChoice,
    pub data_contract_identifier: Identifier,
    pub document_type_name: String,
    pub index_name: String,
    pub index_values: Vec<Value>
}


impl From<MasternodeVoteTransition> for MasternodeVote {
    fn from(transition: MasternodeVoteTransition) -> Self {
        let identifier = transition.vote().vote_poll_unique_id().unwrap();
        let pro_tx_hash = transition.pro_tx_hash().to_string(Hex);
        let voter_identity = transition.voter_identity_id();

        let core_rpc_host: String = env::var("CORE_RPC_HOST").expect("You've not set the CORE_RPC_HOST").parse().expect("Failed to parse CORE_RPC_HOST env");
        let core_rpc_port: String = env::var("CORE_RPC_PORT").expect("You've not set the CORE_RPC_PORT").parse().expect("Failed to parse CORE_RPC_PORT env");
        let core_rpc_user: String = env::var("CORE_RPC_USER").expect("You've not set the CORE_RPC_USER").parse().expect("Failed to parse CORE_RPC_USER env");
        let core_rpc_password: String = env::var("CORE_RPC_PASSWORD").expect("You've not set the CORE_RPC_PASSWORD").parse().expect("Failed to parse CORE_RPC_PASSWORD env");

        let rpc = Client::new(&format!("{}:{}", core_rpc_host, &core_rpc_port),
                              Auth::UserPass(core_rpc_user, core_rpc_password)).unwrap();

        let raw_tx = rpc.get_raw_transaction_info(
            &Txid::from_hex(&pro_tx_hash.to_string()).unwrap(),
            None
        ).unwrap();

        let block_hash = raw_tx.blockhash.unwrap();

        let protx_info = rpc.get_protx_info(
            &ProTxHash::from_hex(&pro_tx_hash.to_string()).unwrap(),
            Some(&block_hash)
        ).unwrap();

        let power = {
            if protx_info.mn_type.unwrap() == "Regular" {
                1i16
            } else {
                4i16
            }
        };

        let vote = transition.vote();

        let vote_info: VoteInfo = match vote {
            Vote::ResourceVote(resource_vote) => {
                match resource_vote {
                    ResourceVote::V0(resource_vote_v0) => {
                        match resource_vote_v0.clone().vote_poll {
                            VotePoll::ContestedDocumentResourceVotePoll(vote_poll) => {
                                VoteInfo {
                                    choice: resource_vote_v0.resource_vote_choice,
                                    data_contract_identifier: vote_poll.contract_id,
                                    document_type_name: vote_poll.document_type_name,
                                    index_name: vote_poll.index_name,
                                    index_values: vote_poll.index_values
                                }
                            }
                        }
                    }
                }
            }
        };

        let towards_identity_identifier: Option<Identifier> = match vote_info.choice {
            ResourceVoteChoice::TowardsIdentity(identifier) => Some(identifier),
            ResourceVoteChoice::Abstain => None,
            ResourceVoteChoice::Lock => None
        };

        return MasternodeVote {
            id: None,
            power,
            identifier,
            pro_tx_hash,
            voter_identity,
            choice: vote_info.choice,
            data_contract_identifier: vote_info.data_contract_identifier,
            towards_identity_identifier,
            document_type_name: vote_info.document_type_name,
            index_name: vote_info.index_name,
            index_values: vote_info.index_values,
        }
    }
}