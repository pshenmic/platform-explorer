const results = {
  dataContracts: [
    { identifier: '8uff2sddkV889RW5xgYYGP7GskCFdh5MN3opC3DLJnwF', name: null, owner: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, schema: '{\'profile\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerId\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'}]},{\'name\':\'ownerIdUpdatedAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\'],\'properties\':{\'avatarUrl\':{\'type\':\'string\',\'format\':\'uri\',\'position\':0,\'maxLength\':2048},\'displayName\':{\'type\':\'string\',\'position\':2,\'maxLength\':25},\'publicMessage\':{\'type\':\'string\',\'position\':1,\'maxLength\':140}},\'additionalProperties\':false},\'contactInfo\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerIdKeyIndexes\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'rootEncryptionKeyIndex\':\'asc\'},{\'derivationEncryptionKeyIndex\':\'asc\'}]},{\'name\':\'owner_updated\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\',\'encToUserId\',\'privateData\',\'rootEncryptionKeyIndex\',\'derivationEncryptionKeyIndex\'],\'properties\':{\'encToUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'privateData\':{\'type\':\'array\',\'maxItems\':2048,\'minItems\':48,\'position\':3,\'byteArray\':true,\'description\':\'This is the encrypted values of aliasName + note + displayHidden encoded as an array in cbor\'},\'rootEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':1},\'derivationEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':2}},\'additionalProperties\':false},\'contactRequest\':{\'type\':\'object\',\'indices\':[{\'name\':\'owner_user_ref\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'},{\'accountReference\':\'asc\'}]},{\'name\':\'ownerId_toUserId\',\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'}]},{\'name\':\'toUserId_$createdAt\',\'properties\':[{\'toUserId\':\'asc\'},{\'$createdAt\':\'asc\'}]},{\'name\':\'$ownerId_$createdAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$createdAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'toUserId\',\'encryptedPublicKey\',\'senderKeyIndex\',\'recipientKeyIndex\',\'accountReference\'],\'properties\':{\'toUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'senderKeyIndex\':{\'type\':\'integer\',\'position\':2},\'accountReference\':{\'type\':\'integer\',\'position\':4},\'recipientKeyIndex\':{\'type\':\'integer\',\'position\':3},\'encryptedPublicKey\':{\'type\':\'array\',\'maxItems\':96,\'minItems\':96,\'position\':1,\'byteArray\':true},\'encryptedAccountLabel\':{\'type\':\'array\',\'maxItems\':80,\'minItems\':48,\'position\':5,\'byteArray\':true}},\'additionalProperties\':false,\'requiresIdentityDecryptionBoundedKey\':2,\'requiresIdentityEncryptionBoundedKey\':2}}', version: 2, txHash: 'E131848076FA5DADDC040898FBF4C79435D0782ACDD2A86D7F064D87D58F43D9', timestamp: '2024-09-19T14:08:53.845Z', isSystem: false, documentsCount: 1937, topIdentity: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, identitiesInteracted: 1, totalGasUsed: 99162602340, averageGasUsed: 51141105 },
    { identifier: '8uff2sddkV889RW5xgYYGP7GskCFdh5MN3opC3DLJnwF', name: null, owner: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, schema: '{\'profile\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerId\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'}]},{\'name\':\'ownerIdUpdatedAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\'],\'properties\':{\'avatarUrl\':{\'type\':\'string\',\'format\':\'uri\',\'position\':0,\'maxLength\':2048},\'displayName\':{\'type\':\'string\',\'position\':2,\'maxLength\':25},\'publicMessage\':{\'type\':\'string\',\'position\':1,\'maxLength\':140}},\'additionalProperties\':false},\'contactInfo\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerIdKeyIndexes\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'rootEncryptionKeyIndex\':\'asc\'},{\'derivationEncryptionKeyIndex\':\'asc\'}]},{\'name\':\'owner_updated\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\',\'encToUserId\',\'privateData\',\'rootEncryptionKeyIndex\',\'derivationEncryptionKeyIndex\'],\'properties\':{\'encToUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'privateData\':{\'type\':\'array\',\'maxItems\':2048,\'minItems\':48,\'position\':3,\'byteArray\':true,\'description\':\'This is the encrypted values of aliasName + note + displayHidden encoded as an array in cbor\'},\'rootEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':1},\'derivationEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':2}},\'additionalProperties\':false},\'contactRequest\':{\'type\':\'object\',\'indices\':[{\'name\':\'owner_user_ref\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'},{\'accountReference\':\'asc\'}]},{\'name\':\'ownerId_toUserId\',\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'}]},{\'name\':\'toUserId_$createdAt\',\'properties\':[{\'toUserId\':\'asc\'},{\'$createdAt\':\'asc\'}]},{\'name\':\'$ownerId_$createdAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$createdAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'toUserId\',\'encryptedPublicKey\',\'senderKeyIndex\',\'recipientKeyIndex\',\'accountReference\'],\'properties\':{\'toUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'senderKeyIndex\':{\'type\':\'integer\',\'position\':2},\'accountReference\':{\'type\':\'integer\',\'position\':4},\'recipientKeyIndex\':{\'type\':\'integer\',\'position\':3},\'encryptedPublicKey\':{\'type\':\'array\',\'maxItems\':96,\'minItems\':96,\'position\':1,\'byteArray\':true},\'encryptedAccountLabel\':{\'type\':\'array\',\'maxItems\':80,\'minItems\':48,\'position\':5,\'byteArray\':true}},\'additionalProperties\':false,\'requiresIdentityDecryptionBoundedKey\':2,\'requiresIdentityEncryptionBoundedKey\':2}}', version: 2, txHash: 'E131848076FA5DADDC040898FBF4C79435D0782ACDD2A86D7F064D87D58F43D9', timestamp: '2024-09-19T14:08:53.845Z', isSystem: false, documentsCount: 1937, topIdentity: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, identitiesInteracted: 1, totalGasUsed: 99162602340, averageGasUsed: 51141105 },
    { identifier: '7CSFGeF4WNzgDmx94zwvHkYaG3Dx4XEe5LFsFgJswLbm', name: 'WalletUtils', owner: { identifier: '11111111111111111111111111111111', aliases: [] }, schema: '{"txMetadata":{"type":"object","indices":[{"name":"updated","properties":[{"$ownerId":"asc"},{"$updatedAt":"asc"}]}],"required":["keyIndex","encryptionKeyIndex","encryptedMetadata","$updatedAt"],"properties":{"keyIndex":{"type":"integer","minimum":0,"position":0,"description":"The derivation index used to create the encryption key."},"encryptedMetadata":{"type":"array","maxItems":4096,"minItems":32,"position":2,"byteArray":true,"description":"encrypted metadata using AES-CBC-256"},"encryptionKeyIndex":{"type":"integer","minimum":0,"position":1,"description":"The secondary index used to derive the encryption key that is used to encrypt and decrypt encryptedData."}},"canBeDeleted":true,"documentsMutable":true,"additionalProperties":false}}', version: 0, txHash: null, timestamp: null, isSystem: true, documentsCount: 67, topIdentity: { identifier: '6xEV5s8FiJUReCuEBCdF3TfMwKggbCNb9RbuxGMEykY8', aliases: [{ alias: 'test-failed-0.dash', status: 'ok', contested: false, timestamp: null }, { alias: 'test-retry-00.dash', status: 'ok', contested: false, timestamp: null }] }, identitiesInteracted: 3, totalGasUsed: 2951205540, averageGasUsed: 43400081 }
  ],
  documents: [
    { identifier: 'DpMzroPo7NFXmACmAZHhsdzPTVCPxNG71PRe17xH7H9', name: null, owner: { identifier: 'iT1dSJE2yChhtR9vof3AoGGNQe1F5D1UZZc2Rk58Pj4', aliases: [{ alias: 'DashMoney3.dash', status: 'ok', contested: false, timestamp: null }] }, schema: '{"about":{"type":"object","indices":[{"name":"ownerId","unique":true,"properties":[{"$ownerId":"asc"}]}],"required":["details","$createdAt","$updatedAt"],"properties":{"details":{"type":"string","position":0,"maxLength":5120,"minLength":0}},"additionalProperties":false},"order":{"type":"object","indices":[{"name":"ownerIdtoIdcreatedAt","unique":false,"properties":[{"$ownerId":"asc"},{"toId":"asc"},{"$createdAt":"asc"}]},{"name":"ownerIdcreatedAt","unique":false,"properties":[{"$ownerId":"asc"},{"$createdAt":"asc"}]},{"name":"toIdcreatedAt","unique":false,"properties":[{"toId":"asc"},{"$createdAt":"asc"}]}],"required":["cart","toId","amt","shipping","msg","$createdAt","$updatedAt"],"properties":{"amt":{"type":"integer","maximum":1000000000000,"minimum":0,"position":2},"msg":{"type":"string","position":4,"maxLength":4000,"minLength":0},"cart":{"type":"string","position":0,"maxLength":5000,"minLength":0},"toId":{"type":"array","maxItems":32,"minItems":32,"position":1,"byteArray":true,"contentMediaType":"application/x.dash.dpp.identifier"},"shipping":{"type":"string","position":3,"maxLength":500,"minLength":0}},"additionalProperties":false},"confirm":{"type":"object","indices":[{"name":"orderId","unique":false,"properties":[{"orderId":"asc"}]},{"name":"ownerIdcreatedAt","unique":false,"properties":[{"$ownerId":"asc"},{"$createdAt":"asc"}]}],"required":["orderId","toId","amt","cart","shipping","msg","$createdAt","$updatedAt"],"properties":{"amt":{"type":"integer","maximum":1000000000000,"minimum":0,"position":2},"msg":{"type":"string","position":5,"maxLength":5000,"minLength":0},"cart":{"type":"string","position":3,"maxLength":5000,"minLength":0},"toId":{"type":"array","maxItems":32,"minItems":32,"position":1,"byteArray":true,"contentMediaType":"application/x.dash.dpp.identifier"},"orderId":{"type":"array","maxItems":32,"minItems":32,"position":0,"byteArray":true,"contentMediaType":"application/x.dash.dpp.identifier"},"shipping":{"type":"string","position":4,"maxLength":500,"minLength":0}},"additionalProperties":false},"inventory":{"type":"object","indices":[{"name":"ownerIdupdatedAt","unique":false,"properties":[{"$ownerId":"asc"},{"$updatedAt":"asc"}]}],"required":["items","itemsImgs","more","excess","open","shipOpts","$createdAt","$updatedAt"],"properties":{"more":{"type":"string","position":2,"maxLength":5120,"minLength":0},"open":{"type":"boolean","position":4},"items":{"type":"string","position":0,"maxLength":5120,"minLength":0},"excess":{"type":"string","position":3,"maxLength":5120,"minLength":0},"shipOpts":{"type":"string","position":5,"maxLength":1000,"minLength":0},"itemsImgs":{"type":"string","position":1,"maxLength":5120,"minLength":0}},"additionalProperties":false}}', version: 1, txHash: '23D3E181CF330240AEF3EB78CA9C09CD2A95925AB07F59490DC07AA7D42634C6', timestamp: '2025-02-11T17:31:46.392Z', isSystem: false, documentsCount: 13, topIdentity: { identifier: 'iT1dSJE2yChhtR9vof3AoGGNQe1F5D1UZZc2Rk58Pj4', aliases: [{ alias: 'DashMoney3.dash', status: 'ok', contested: false, timestamp: null }] }, identitiesInteracted: 4, totalGasUsed: 1079334080, averageGasUsed: 44972253 },
    { identifier: 'BSvQfoMcTbDyQkhVhwhw1S2RPKWo7BurajxZHud4Fxhq', dataContractIdentifier: 'DpMzroPo7NFXmACmAZHhsdzPTVCPxNG71PRe17xH7H9', revision: 7, txHash: 'CD126A448BEDF79DD4A3DF3C7F6405C1A8A79B99787855AAFB52FDFE1EA3C39A', deleted: false, data: '{"more":"","open":true,"items":"[{\\"name\\":\\"Cool T-Shirt\\",\\"itemId\\":\\"cool t-shirt663\\",\\"description\\":\\"Light-weight, breathable, tri-blend polymer that is soft and machine washable.\\",\\"imgArray\\":[\\"https://i.imgur.com/znIcOgA.jpeg\\"],\\"linkArray\\":\\"\\",\\"variants\\":[[\\"\\",25,50000000]],\\"extraInfo\\":\\"\\",\\"active\\":true},{\\"name\\":\\"Dash Water Bottle\\",\\"itemId\\":\\"dash water bottle625\\",\\"description\\":\\"Keep your drink cool or hot with the best bottles on the market!\\",\\"linkArray\\":\\"\\",\\"variants\\":[[\\"Large\\",\\"12\\",40000000],[\\"Medium\\",\\"0\\",30000000],[\\"Small\\",\\"\\",20000000]],\\"extraInfo\\":\\"\\",\\"active\\":true,\\"imgArray\\":[\\"https://m.media-amazon.com/images/I/61rA3Ocd1TL._AC_SX679_.jpg\\"]}]","excess":"","shipOpts":"[[\\"Standard (4-7 days)\\",\\"standard (4-7 days)629\\",30000000]]","itemsImgs":"[[\\"https://i.imgur.com/znIcOgA.jpeg\\"],[\\"https://m.media-amazon.com/images/I/61rA3Ocd1TL._AC_SX679_.jpg\\"]]"}', timestamp: '2025-02-17T19:05:32.134Z', system: false, entropy: '7e17f2a09319d86768ebc94ca8cc9437280e73b16dcb3e82ab3e5c4e67bd9fb4', prefundedVotingBalance: null, documentTypeName: 'inventory', transitionType: 1, nonce: 2, gasUsed: null, totalGasUsed: 171698380, owner: { identifier: 'iT1dSJE2yChhtR9vof3AoGGNQe1F5D1UZZc2Rk58Pj4', aliases: [{ alias: 'DashMoney3.dash', status: 'ok', contested: false, timestamp: null }] } },
    { identifier: 'BSvQfoMcTbDyQkhVhwhw1S2RPKWo7BurajxZHud4Fxhq', dataContractIdentifier: 'DpMzroPo7NFXmACmAZHhsdzPTVCPxNG71PRe17xH7H9', revision: 7, txHash: 'CD126A448BEDF79DD4A3DF3C7F6405C1A8A79B99787855AAFB52FDFE1EA3C39A', deleted: false, data: '{"more":"","open":true,"items":"[{\\"name\\":\\"Cool T-Shirt\\",\\"itemId\\":\\"cool t-shirt663\\",\\"description\\":\\"Light-weight, breathable, tri-blend polymer that is soft and machine washable.\\",\\"imgArray\\":[\\"https://i.imgur.com/znIcOgA.jpeg\\"],\\"linkArray\\":\\"\\",\\"variants\\":[[\\"\\",25,50000000]],\\"extraInfo\\":\\"\\",\\"active\\":true},{\\"name\\":\\"Dash Water Bottle\\",\\"itemId\\":\\"dash water bottle625\\",\\"description\\":\\"Keep your drink cool or hot with the best bottles on the market!\\",\\"linkArray\\":\\"\\",\\"variants\\":[[\\"Large\\",\\"12\\",40000000],[\\"Medium\\",\\"0\\",30000000],[\\"Small\\",\\"\\",20000000]],\\"extraInfo\\":\\"\\",\\"active\\":true,\\"imgArray\\":[\\"https://m.media-amazon.com/images/I/61rA3Ocd1TL._AC_SX679_.jpg\\"]}]","excess":"","shipOpts":"[[\\"Standard (4-7 days)\\",\\"standard (4-7 days)629\\",30000000]]","itemsImgs":"[[\\"https://i.imgur.com/znIcOgA.jpeg\\"],[\\"https://m.media-amazon.com/images/I/61rA3Ocd1TL._AC_SX679_.jpg\\"]]"}', timestamp: '2025-02-17T19:05:32.134Z', system: false, entropy: '7e17f2a09319d86768ebc94ca8cc9437280e73b16dcb3e82ab3e5c4e67bd9fb4', prefundedVotingBalance: null, documentTypeName: 'inventory', transitionType: 1, nonce: 2, gasUsed: null, totalGasUsed: 171698380, owner: { identifier: 'iT1dSJE2yChhtR9vof3AoGGNQe1F5D1UZZc2Rk58Pj4', aliases: [{ alias: 'DashMoney3.dash', status: 'ok', contested: false, timestamp: null }] } }
  ],
  identities: [
    {
      identifier: '36LGwPSXef8q8wpdnx4EdDeVNuqCYNAE9boDu5bxytsm',
      alias: 'xyz.dash',
      status: {
        alias: 'xyz.dash',
        status: 'ok',
        contested: true
      }
    },
    {
      identifier: '5bUPV8KGgL42ZBS9fsmmKU3wweQbVeHHsiVrG3YMHyG5',
      alias: 'xyz.dash',
      status: {
        alias: 'xyz.dash',
        status: 'locked',
        contested: true
      }
    }
  ],
  blocks: [
    { header: { hash: '4AF4C988A2CF38875C5C376B164ED7AA346B3FE6629EB3F7BA45ADD75BFF830B', height: 24, timestamp: '2024-08-25T09:22:07.900Z', blockVersion: 14, appVersion: 1, l1LockedHeight: 1090330, validator: 'FF261D2C1C76907A2AD8AEB6C5611796F03B5CBD88AE92452A4727E13F4F4AC9', totalGasUsed: 0, appHash: 'B3DB8B541B5018ED2D801E3647AFD32EF431879686055910D9BA3FA322CFC5DC' }, txs: [] },
    { header: { hash: '4AF4C988A2CF38875C5C376B164ED7AA346B3FE6629EB3F7BA45ADD75BFF830B', height: 24, timestamp: '2024-08-25T09:22:07.900Z', blockVersion: 14, appVersion: 1, l1LockedHeight: 1090330, validator: 'FF261D2C1C76907A2AD8AEB6C5611796F03B5CBD88AE92452A4727E13F4F4AC9', totalGasUsed: 0, appHash: 'B3DB8B541B5018ED2D801E3647AFD32EF431879686055910D9BA3FA322CFC5DC' }, txs: [] }
  ],
  validators: [
    { proTxHash: 'BBFD0AC1977011267A7032641EF5487FE15A4DE798FAA485B156FB3B7EB0ACB8', isActive: null, proposedBlocksAmount: 1265, lastProposedBlockHeader: { hash: '5AEAD743C416E3A97064AA5CDDA47007D2F5C0A98455C14DE5406321C71D93F1', height: 40451, timestamp: '2024-10-24T16:38:42.214Z', blockVersion: 14, appVersion: 4, l1LockedHeight: 1127538, validator: 'BBFD0AC1977011267A7032641EF5487FE15A4DE798FAA485B156FB3B7EB0ACB8', totalGasUsed: 0, appHash: '22C0A15471205C465F119AD618017A6127F52325333FB53B4F45624D75006B57' }, proTxInfo: null, identity: null, identityBalance: null, epochInfo: null, totalReward: 10098427600, epochReward: 0, withdrawalsCount: 0, lastWithdrawal: null, lastWithdrawalTime: null, endpoints: null },
    { proTxHash: 'BBFD0AC1977011267A7032641EF5487FE15A4DE798FAA485B156FB3B7EB0ACB8', isActive: null, proposedBlocksAmount: 1265, lastProposedBlockHeader: { hash: '5AEAD743C416E3A97064AA5CDDA47007D2F5C0A98455C14DE5406321C71D93F1', height: 40451, timestamp: '2024-10-24T16:38:42.214Z', blockVersion: 14, appVersion: 4, l1LockedHeight: 1127538, validator: 'BBFD0AC1977011267A7032641EF5487FE15A4DE798FAA485B156FB3B7EB0ACB8', totalGasUsed: 0, appHash: '22C0A15471205C465F119AD618017A6127F52325333FB53B4F45624D75006B57' }, proTxInfo: null, identity: null, identityBalance: null, epochInfo: null, totalReward: 10098427600, epochReward: 0, withdrawalsCount: 0, lastWithdrawal: null, lastWithdrawalTime: null, endpoints: null }
  ],
  transactions: [
    { hash: 'C494F7DCC5DE7BFAC79CC60F501A7C39EDE237892A769A57482349DB11277C2D', index: 0, blockHash: '189156BD81E0F23929BBE2B69087DAD0472926FCE7D23EF9BC76ED0CBFA1BDDD', blockHeight: 109465, type: 0, data: 'AAAAf96K8qDCny4Ddi4PJZwUBGOLsi/5bAYonImHZzkaxOgAAAAAAAEBAAABRkfUXZiAWnpN+HV0kLTc0ZyrZYgsWj7a2l3sLlng0ngAAQhzaG93Tm90ZRYDEgR0eXBlEgZvYmplY3QSCnByb3BlcnRpZXMWBBILZnJvbnRNYXR0ZXIWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMAEgZwcm9tcHQWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMCEglsbG1PdXRwdXQWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMEEgp0cmFuc2NyaXB0FgISBHR5cGUSBnN0cmluZxIIcG9zaXRpb24DBhIUYWRkaXRpb25hbFByb3BlcnRpZXMTAAEAAkEg6LRcJOwPs3Tm8DfAVCPJlNGlhQkjKLT3djCi2GFchxk6MWhN6C5E8fgzuV9gumJ9byh1ax78lfDiDkxWbsZIxw==', timestamp: '2025-03-03T12:15:29.825Z', gasUsed: 39226830, status: 'SUCCESS', error: null, owner: { identifier: '5jM4nYqQeBQ8t1hgtF8yLUhXqMiwJUcb3Yibhaqatukb', aliases: [] } },
    { hash: 'C494F7DCC5DE7BFAC79CC60F501A7C39EDE237892A769A57482349DB11277C2D', index: 0, blockHash: '189156BD81E0F23929BBE2B69087DAD0472926FCE7D23EF9BC76ED0CBFA1BDDD', blockHeight: 109465, type: 0, data: 'AAAAf96K8qDCny4Ddi4PJZwUBGOLsi/5bAYonImHZzkaxOgAAAAAAAEBAAABRkfUXZiAWnpN+HV0kLTc0ZyrZYgsWj7a2l3sLlng0ngAAQhzaG93Tm90ZRYDEgR0eXBlEgZvYmplY3QSCnByb3BlcnRpZXMWBBILZnJvbnRNYXR0ZXIWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMAEgZwcm9tcHQWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMCEglsbG1PdXRwdXQWAhIEdHlwZRIGc3RyaW5nEghwb3NpdGlvbgMEEgp0cmFuc2NyaXB0FgISBHR5cGUSBnN0cmluZxIIcG9zaXRpb24DBhIUYWRkaXRpb25hbFByb3BlcnRpZXMTAAEAAkEg6LRcJOwPs3Tm8DfAVCPJlNGlhQkjKLT3djCi2GFchxk6MWhN6C5E8fgzuV9gumJ9byh1ax78lfDiDkxWbsZIxw==', timestamp: '2025-03-03T12:15:29.825Z', gasUsed: 39226830, status: 'SUCCESS', error: null, owner: { identifier: '5jM4nYqQeBQ8t1hgtF8yLUhXqMiwJUcb3Yibhaqatukb', aliases: [] } }
  ]
}

export default results
