use std::fmt;

pub enum BatchType {
    DocumentCreateTransition,
    DocumentReplaceTransition,
    DocumentDeleteTransition,
    DocumentTransferTransition,
    DocumentUpdatePriceTransition,
    DocumentPurchaseTransition,
    TokenBurnTransition,
    TokenMintTransition,
    TokenTransferTransition,
    TokenFreezeTransition,
    TokenUnfreezeTransition,
    TokenDestroyFrozenFundsTransition,
    TokenClaimTransition,
    TokenEmergencyActionTransition,
    TokenConfigUpdateTransition,
    TokenDirectPurchaseTransition,
    TokenSetPriceForDirectPurchaseTransition,
}

impl fmt::Display for BatchType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let batch_type_string = match self {
            BatchType::DocumentCreateTransition => "DOCUMENT_CREATE",
            BatchType::DocumentReplaceTransition => "DOCUMENT_REPLACE",
            BatchType::DocumentDeleteTransition => "DOCUMENT_DELETE",
            BatchType::DocumentTransferTransition => "DOCUMENT_TRANSFER",
            BatchType::DocumentUpdatePriceTransition => "DOCUMENT_UPDATE_PRICE",
            BatchType::DocumentPurchaseTransition => "DOCUMENT_PURCHASE",
            BatchType::TokenBurnTransition => "TOKEN_BURN",
            BatchType::TokenMintTransition => "TOKEN_MINT",
            BatchType::TokenTransferTransition => "TOKEN_TRANSFER",
            BatchType::TokenFreezeTransition => "TOKEN_FREEZE",
            BatchType::TokenUnfreezeTransition => "TOKEN_UNFREEZE",
            BatchType::TokenDestroyFrozenFundsTransition => "TOKEN_DESTROY",
            BatchType::TokenClaimTransition => "TOKEN_CLAIM",
            BatchType::TokenEmergencyActionTransition => "TOKEN_EMERGENCY_ACTION",
            BatchType::TokenConfigUpdateTransition => "TOKEN_CONFIG_UPDATE",
            BatchType::TokenDirectPurchaseTransition => "TOKEN_DIRECT_PURCHASE",
            BatchType::TokenSetPriceForDirectPurchaseTransition => {
                "TOKEN_SET_PRICE_FOR_DIRECT_PURCHASE"
            }
        };

        write!(f, "{batch_type_string}")
    }
}
