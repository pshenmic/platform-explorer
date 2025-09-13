use std::fmt::Display;

#[derive(Clone, Debug)]
pub enum IdentifierType {
    Regular,
    Masternode,
    Voting,
}

impl From<String> for IdentifierType {
    fn from(s: String) -> Self {
        match s.to_lowercase().as_str() {
            "regular" => IdentifierType::Regular,
            "masternode" => IdentifierType::Masternode,
            "voting" => IdentifierType::Voting,
            _ => {
                panic!("Unsupported identifier type: {}", s);
            }
        }
    }
}

impl Display for IdentifierType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
