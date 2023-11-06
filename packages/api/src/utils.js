const crypto = require('crypto')

const StateTransitionEnum = {
    DATA_CONTRACT_CREATE: 0,
    DOCUMENTS_BATCH: 1,
    IDENTITY_CREATE: 2,
    IDENTITY_TOP_UP: 3,
    DATA_CONTRACT_UPDATE: 4,
    IDENTITY_UPDATE: 5,
    IDENTITY_CREDIT_WITHDRAWAL:6,
    IDENTITY_CREDIT_TRANSFER: 7
};

const hash = (data) => {
    return crypto.createHash('sha1').update(data).digest('hex');
}

const decodeStateTransition = async (client, base64) => {
    const stateTransition = await client.platform.dpp.stateTransition.createFromBuffer(Buffer.from(base64, 'base64'));

    const decoded = {
        type: stateTransition.getType()
    }

    switch (decoded.type) {
        case StateTransitionEnum.DATA_CONTRACT_CREATE: {
            decoded.dataContractId = stateTransition.getDataContract().getId().toString()
            decoded.identityId = stateTransition.getOwnerId().toString()

            break
        }
        case StateTransitionEnum.DOCUMENTS_BATCH: {
            decoded.transitions = stateTransition.getTransitions().map((documentTransition) => ({
                id: documentTransition.getId().toString(),
                dataContractId: documentTransition.getDataContractId().toString(),
                action: documentTransition.getAction(),
                revision: documentTransition.getRevision(),
                createdAt: documentTransition.getCreatedAt(),
                updatedAt: documentTransition.getUpdatedAt()
            }))

            break
        }
        case StateTransitionEnum.IDENTITY_CREATE: {
            decoded.identityId = stateTransition.getIdentityId().toString()

            break
        }
        case StateTransitionEnum.IDENTITY_TOP_UP: {
            const assetLockProof = stateTransition.getAssetLockProof()
            const output = assetLockProof.getOutput()

            decoded.identityId = stateTransition.getIdentityId().toString()
            decoded.amount = output.satoshis * 1000;

            break
        }
        case StateTransitionEnum.DATA_CONTRACT_UPDATE: {
            decoded.identityId = stateTransition.getDataContract().getOwnerId().toString()
            decoded.dataContractId = stateTransition.getDataContract().getId().toString()
            decoded.version = stateTransition.getDataContract().getVersion()

            break
        }
        case StateTransitionEnum.IDENTITY_UPDATE: {
            decoded.identityId = stateTransition.getOwnerId().toString()
            decoded.revision = stateTransition.getRevision()

            break
        }
        case StateTransitionEnum.IDENTITY_CREDIT_TRANSFER: {
            decoded.senderId = stateTransition.getIdentityId().toString()
            decoded.recipientId = stateTransition.getRecipientId().toString()
            decoded.amount = stateTransition.getAmount()

            break
        }
        default:
            throw new Error('Unknown state transition')
    }

    return decoded;
}

module.exports = {hash, decodeStateTransition}
