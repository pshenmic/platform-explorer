use std::fmt::Display;

#[derive(Clone, Debug)]
pub enum VotingKeyPurpose {
    OWNER,
    VOTING,
}

impl From<String> for VotingKeyPurpose {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "owner" => VotingKeyPurpose::OWNER,
            "voting" => VotingKeyPurpose::VOTING,
            _ => panic!("Unsupported key purpose: {}", s),
        }
    }
}

impl Display for VotingKeyPurpose {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
