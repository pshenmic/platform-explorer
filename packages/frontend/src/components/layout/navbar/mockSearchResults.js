const results = {
  dataContracts: [
    { identifier: '8uff2sddkV889RW5xgYYGP7GskCFdh5MN3opC3DLJnwF', name: null, owner: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, schema: '{\'profile\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerId\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'}]},{\'name\':\'ownerIdUpdatedAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\'],\'properties\':{\'avatarUrl\':{\'type\':\'string\',\'format\':\'uri\',\'position\':0,\'maxLength\':2048},\'displayName\':{\'type\':\'string\',\'position\':2,\'maxLength\':25},\'publicMessage\':{\'type\':\'string\',\'position\':1,\'maxLength\':140}},\'additionalProperties\':false},\'contactInfo\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerIdKeyIndexes\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'rootEncryptionKeyIndex\':\'asc\'},{\'derivationEncryptionKeyIndex\':\'asc\'}]},{\'name\':\'owner_updated\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\',\'encToUserId\',\'privateData\',\'rootEncryptionKeyIndex\',\'derivationEncryptionKeyIndex\'],\'properties\':{\'encToUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'privateData\':{\'type\':\'array\',\'maxItems\':2048,\'minItems\':48,\'position\':3,\'byteArray\':true,\'description\':\'This is the encrypted values of aliasName + note + displayHidden encoded as an array in cbor\'},\'rootEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':1},\'derivationEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':2}},\'additionalProperties\':false},\'contactRequest\':{\'type\':\'object\',\'indices\':[{\'name\':\'owner_user_ref\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'},{\'accountReference\':\'asc\'}]},{\'name\':\'ownerId_toUserId\',\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'}]},{\'name\':\'toUserId_$createdAt\',\'properties\':[{\'toUserId\':\'asc\'},{\'$createdAt\':\'asc\'}]},{\'name\':\'$ownerId_$createdAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$createdAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'toUserId\',\'encryptedPublicKey\',\'senderKeyIndex\',\'recipientKeyIndex\',\'accountReference\'],\'properties\':{\'toUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'senderKeyIndex\':{\'type\':\'integer\',\'position\':2},\'accountReference\':{\'type\':\'integer\',\'position\':4},\'recipientKeyIndex\':{\'type\':\'integer\',\'position\':3},\'encryptedPublicKey\':{\'type\':\'array\',\'maxItems\':96,\'minItems\':96,\'position\':1,\'byteArray\':true},\'encryptedAccountLabel\':{\'type\':\'array\',\'maxItems\':80,\'minItems\':48,\'position\':5,\'byteArray\':true}},\'additionalProperties\':false,\'requiresIdentityDecryptionBoundedKey\':2,\'requiresIdentityEncryptionBoundedKey\':2}}', version: 2, txHash: 'E131848076FA5DADDC040898FBF4C79435D0782ACDD2A86D7F064D87D58F43D9', timestamp: '2024-09-19T14:08:53.845Z', isSystem: false, documentsCount: 1937, topIdentity: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, identitiesInteracted: 1, totalGasUsed: 99162602340, averageGasUsed: 51141105 },
    { identifier: '8uff2sddkV889RW5xgYYGP7GskCFdh5MN3opC3DLJnwF', name: null, owner: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, schema: '{\'profile\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerId\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'}]},{\'name\':\'ownerIdUpdatedAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\'],\'properties\':{\'avatarUrl\':{\'type\':\'string\',\'format\':\'uri\',\'position\':0,\'maxLength\':2048},\'displayName\':{\'type\':\'string\',\'position\':2,\'maxLength\':25},\'publicMessage\':{\'type\':\'string\',\'position\':1,\'maxLength\':140}},\'additionalProperties\':false},\'contactInfo\':{\'type\':\'object\',\'indices\':[{\'name\':\'ownerIdKeyIndexes\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'rootEncryptionKeyIndex\':\'asc\'},{\'derivationEncryptionKeyIndex\':\'asc\'}]},{\'name\':\'owner_updated\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$updatedAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'$updatedAt\',\'encToUserId\',\'privateData\',\'rootEncryptionKeyIndex\',\'derivationEncryptionKeyIndex\'],\'properties\':{\'encToUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'privateData\':{\'type\':\'array\',\'maxItems\':2048,\'minItems\':48,\'position\':3,\'byteArray\':true,\'description\':\'This is the encrypted values of aliasName + note + displayHidden encoded as an array in cbor\'},\'rootEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':1},\'derivationEncryptionKeyIndex\':{\'type\':\'integer\',\'position\':2}},\'additionalProperties\':false},\'contactRequest\':{\'type\':\'object\',\'indices\':[{\'name\':\'owner_user_ref\',\'unique\':true,\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'},{\'accountReference\':\'asc\'}]},{\'name\':\'ownerId_toUserId\',\'properties\':[{\'$ownerId\':\'asc\'},{\'toUserId\':\'asc\'}]},{\'name\':\'toUserId_$createdAt\',\'properties\':[{\'toUserId\':\'asc\'},{\'$createdAt\':\'asc\'}]},{\'name\':\'$ownerId_$createdAt\',\'properties\':[{\'$ownerId\':\'asc\'},{\'$createdAt\':\'asc\'}]}],\'required\':[\'$createdAt\',\'toUserId\',\'encryptedPublicKey\',\'senderKeyIndex\',\'recipientKeyIndex\',\'accountReference\'],\'properties\':{\'toUserId\':{\'type\':\'array\',\'maxItems\':32,\'minItems\':32,\'position\':0,\'byteArray\':true},\'senderKeyIndex\':{\'type\':\'integer\',\'position\':2},\'accountReference\':{\'type\':\'integer\',\'position\':4},\'recipientKeyIndex\':{\'type\':\'integer\',\'position\':3},\'encryptedPublicKey\':{\'type\':\'array\',\'maxItems\':96,\'minItems\':96,\'position\':1,\'byteArray\':true},\'encryptedAccountLabel\':{\'type\':\'array\',\'maxItems\':80,\'minItems\':48,\'position\':5,\'byteArray\':true}},\'additionalProperties\':false,\'requiresIdentityDecryptionBoundedKey\':2,\'requiresIdentityEncryptionBoundedKey\':2}}', version: 2, txHash: 'E131848076FA5DADDC040898FBF4C79435D0782ACDD2A86D7F064D87D58F43D9', timestamp: '2024-09-19T14:08:53.845Z', isSystem: false, documentsCount: 1937, topIdentity: { identifier: 'BH3zGkUewGZQJ9tzdrBn3FJRjhTkfQmvewo6t1LNnnG5', aliases: [] }, identitiesInteracted: 1, totalGasUsed: 99162602340, averageGasUsed: 51141105 },
    { identifier: '7CSFGeF4WNzgDmx94zwvHkYaG3Dx4XEe5LFsFgJswLbm', name: 'WalletUtils', owner: { identifier: '11111111111111111111111111111111', aliases: [] }, schema: '{"txMetadata":{"type":"object","indices":[{"name":"updated","properties":[{"$ownerId":"asc"},{"$updatedAt":"asc"}]}],"required":["keyIndex","encryptionKeyIndex","encryptedMetadata","$updatedAt"],"properties":{"keyIndex":{"type":"integer","minimum":0,"position":0,"description":"The derivation index used to create the encryption key."},"encryptedMetadata":{"type":"array","maxItems":4096,"minItems":32,"position":2,"byteArray":true,"description":"encrypted metadata using AES-CBC-256"},"encryptionKeyIndex":{"type":"integer","minimum":0,"position":1,"description":"The secondary index used to derive the encryption key that is used to encrypt and decrypt encryptedData."}},"canBeDeleted":true,"documentsMutable":true,"additionalProperties":false}}', version: 0, txHash: null, timestamp: null, isSystem: true, documentsCount: 67, topIdentity: { identifier: '6xEV5s8FiJUReCuEBCdF3TfMwKggbCNb9RbuxGMEykY8', aliases: [{ alias: 'test-failed-0.dash', status: 'ok', contested: false, timestamp: null }, { alias: 'test-retry-00.dash', status: 'ok', contested: false, timestamp: null }] }, identitiesInteracted: 3, totalGasUsed: 2951205540, averageGasUsed: 43400081 }
  ],
  documents: [
    {
      identifier: 'DjCs7wZ527EdAf1qQcJVAz2B7Dhd4KEFHejuWbfjUb6a',
      dataContractIdentifier: '6hVQW16jyvZyGSQk2YVty4ND6bgFXozizYWnPt753uW5',
      revision: 2,
      txHash: '983191D51332DA1C33A4D4EA5E71CEDEB5BEF7DB936B30E99D81E7255C1BDC2B',
      deleted: false,
      data: '{"name":"Breaking Bad S02 BDRip 1080p SOFCJ","magnet":"magnet:?xt=urn:btih:3C6D14A61A17748F8EE11C1DC75D12B03115E1B3&tr=http%3A%2F%2Fbt2.t-ru.org%2Fann%3Fmagnet&dn=%D0%92%D0%BE%20%D0%B2%D1%81%D0%B5%20%D1%82%D1%8F%D0%B6%D0%BA%D0%B8%D0%B5%20%2F%20Breaking%20Bad%20%2F%20%D0%A1%D0%B5%D0%B7%D0%BE%D0%BD%3A%202%20%2F%20%D0%A1%D0%B5%D1%80%D0%B8%D0%B8%201-13%20(13)%20(%D0%92%D0%B8%D0%BD%D1%81%20%D0%93%D0%B8%D0%BB%D0%BB%D0%B8%D0%B3%D0%B0%D0%BD%20%2F%20Vince%20Gilligan)%20%5B2009%2C%20%D0%A1%D0%A8%D0%90%2C%20%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%2C%20%D0%BA%D1%80%D0%B8%D0%BC%D0%B8%D0%BD%D0%B0%D0%BB%2C%20BDRip%201080p%5D%20Dub%20(Selena%20Inter","description":"https://rutracker.org/forum/viewtopic.php?t=6356185"}',
      timestamp: '2025-03-09T20:16:31.203Z',
      system: false,
      entropy: 'bc0756c811fa842d4148b3625fccf7ce708e4f6c8fce88cba8ad90993f82bb57',
      prefundedVotingBalance: null,
      documentTypeName: 'torrent',
      transitionType: 1,
      nonce: '12',
      gasUsed: null,
      totalGasUsed: 31209960,
      owner: {
        identifier: 'HTfJKDuW8omFfFrSQuNTkgW39WpncdwFUrL91VJyJXUS',
        aliases: []
      }
    },
    {
      identifier: 'DjCs7wZ527EdAf1qQcJVAz2B7Dhd4KEFHejuWbfjUb6a',
      dataContractIdentifier: '6hVQW16jyvZyGSQk2YVty4ND6bgFXozizYWnPt753uW5',
      revision: 2,
      txHash: '983191D51332DA1C33A4D4EA5E71CEDEB5BEF7DB936B30E99D81E7255C1BDC2B',
      deleted: false,
      data: '{"name":"Breaking Bad S02 BDRip 1080p SOFCJ","magnet":"magnet:?xt=urn:btih:3C6D14A61A17748F8EE11C1DC75D12B03115E1B3&tr=http%3A%2F%2Fbt2.t-ru.org%2Fann%3Fmagnet&dn=%D0%92%D0%BE%20%D0%B2%D1%81%D0%B5%20%D1%82%D1%8F%D0%B6%D0%BA%D0%B8%D0%B5%20%2F%20Breaking%20Bad%20%2F%20%D0%A1%D0%B5%D0%B7%D0%BE%D0%BD%3A%202%20%2F%20%D0%A1%D0%B5%D1%80%D0%B8%D0%B8%201-13%20(13)%20(%D0%92%D0%B8%D0%BD%D1%81%20%D0%93%D0%B8%D0%BB%D0%BB%D0%B8%D0%B3%D0%B0%D0%BD%20%2F%20Vince%20Gilligan)%20%5B2009%2C%20%D0%A1%D0%A8%D0%90%2C%20%D0%B4%D1%80%D0%B0%D0%BC%D0%B0%2C%20%D0%BA%D1%80%D0%B8%D0%BC%D0%B8%D0%BD%D0%B0%D0%BB%2C%20BDRip%201080p%5D%20Dub%20(Selena%20Inter","description":"https://rutracker.org/forum/viewtopic.php?t=6356185"}',
      timestamp: '2025-03-09T20:16:31.203Z',
      system: false,
      entropy: 'bc0756c811fa842d4148b3625fccf7ce708e4f6c8fce88cba8ad90993f82bb57',
      prefundedVotingBalance: null,
      documentTypeName: 'torrent',
      transitionType: 1,
      nonce: '12',
      gasUsed: null,
      totalGasUsed: 31209960,
      owner: {
        identifier: 'HTfJKDuW8omFfFrSQuNTkgW39WpncdwFUrL91VJyJXUS',
        aliases: []
      }
    }
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
    {
      proTxHash: '754B89DAE8DB20FC4CEE5E3ADB07B146D7EFE508A66FA0A8E1094675B9DAA35E',
      isActive: null,
      proposedBlocksAmount: 964,
      lastProposedBlockHeader: {
        hash: 'DE8BD4D694B9B13580F7828844210C6865BE55122DD93617068BA644AC900B0A',
        height: 43887,
        timestamp: '2024-10-30T14:29:17.618Z',
        blockVersion: 14,
        appVersion: 4,
        l1LockedHeight: 1131137,
        validator: '754B89DAE8DB20FC4CEE5E3ADB07B146D7EFE508A66FA0A8E1094675B9DAA35E',
        totalGasUsed: 0,
        appHash: 'D981EF01CBAB690C3ED90D7A4A021069B6A0EFBBDEDF00BDED32B28DEA70AC92'
      },
      proTxInfo: null,
      identity: null,
      identityBalance: null,
      epochInfo: null,
      totalReward: 5021898170,
      epochReward: 0,
      withdrawalsCount: 0,
      lastWithdrawal: null,
      lastWithdrawalTime: null,
      endpoints: null
    },
    {
      proTxHash: '754B89DAE8DB20FC4CEE5E3ADB07B146D7EFE508A66FA0A8E1094675B9DAA35E',
      isActive: null,
      proposedBlocksAmount: 964,
      lastProposedBlockHeader: {
        hash: 'DE8BD4D694B9B13580F7828844210C6865BE55122DD93617068BA644AC900B0A',
        height: 43887,
        timestamp: '2024-10-30T14:29:17.618Z',
        blockVersion: 14,
        appVersion: 4,
        l1LockedHeight: 1131137,
        validator: '754B89DAE8DB20FC4CEE5E3ADB07B146D7EFE508A66FA0A8E1094675B9DAA35E',
        totalGasUsed: 0,
        appHash: 'D981EF01CBAB690C3ED90D7A4A021069B6A0EFBBDEDF00BDED32B28DEA70AC92'
      },
      proTxInfo: null,
      identity: null,
      identityBalance: null,
      epochInfo: null,
      totalReward: 5021898170,
      epochReward: 0,
      withdrawalsCount: 0,
      lastWithdrawal: null,
      lastWithdrawalTime: null,
      endpoints: null
    }
  ],
  transactions: [
    {
      hash: '59D0C42F02171204416642FA0FCAF1FC130B9C31ECB460A095530CDE7EDF5710',
      index: 0,
      blockHash: '9EB25FB5073A07F7371AC4DC35D2645ED435CA8E77F65C1E575A7E1F5019095F',
      blockHeight: 113383,
      type: 2,
      data: 'AwADAAAAAAAAACEDgUvM5arsJ6cAYAsy8RJuCIKIFlh3esXGxIjU0Fi/AIFBINDQTega/WhOJqDr0/ZMezt0xGKNJosx6ANgkNDIekm4A0RTN4rq5fCtDssxQVy352Ba5SyFatb5T2ZcxvTsAKIAAQAAAgAAIQN9/7l1QgAuzwMYUzqeuQzCayJi05HoZHtutK8s5aJnQkEfbhDBCihurFfFcTm2Ey7zwWLmYrjHsilUlzBEudxumxEFL9vp1LEC0ZnuieLXKukJSS2kg6RSuqKXdB26ssIybQACAAEDAAAhAvHQl3j+8ilC6iFnyfMXgvenj4vWzmvQ82Mk/sXJ4WlLQSBFQCVu0WNgrGdUo7Wqj749jXrq4l3jQodVJyKV1uqyDk98WWrnbbOwWXSMvqaHLQToRdgvzRBSz0OLJThjo7WPAfwAEnx1INoQhfd70M3yHVUTMKhQxWMe7ujJx4m3yDXJCRoCml+rAABBH89rKS6/eSP/Qk4HjeIaQoUNclo1RahqvjgWTkoDUyseeBr3xZeSrIHVuiulGw84YNIewbKoAivwETcilqGL/aPqlNEdpfDLSx1he5//GLQnhs2w9HNVQtcsKxsFYtdwqA==',
      timestamp: '2025-03-11T15:32:29.426Z',
      gasUsed: 100908180,
      status: 'SUCCESS',
      error: null,
      owner: {
        identifier: 'Gni1ugX2yQwFouEUPH8rjbgYAEMQ4rXbKXQgqF9s2bh9',
        aliases: [
          {
            alias: 'test-invite-0.dash',
            status: 'ok',
            contested: false,
            timestamp: '2025-03-11T18:32:32.993+03:00'
          }
        ]
      }
    },
    {
      hash: '59D0C42F02171204416642FA0FCAF1FC130B9C31ECB460A095530CDE7EDF5710',
      index: 0,
      blockHash: '9EB25FB5073A07F7371AC4DC35D2645ED435CA8E77F65C1E575A7E1F5019095F',
      blockHeight: 113383,
      type: 2,
      data: 'AwADAAAAAAAAACEDgUvM5arsJ6cAYAsy8RJuCIKIFlh3esXGxIjU0Fi/AIFBINDQTega/WhOJqDr0/ZMezt0xGKNJosx6ANgkNDIekm4A0RTN4rq5fCtDssxQVy352Ba5SyFatb5T2ZcxvTsAKIAAQAAAgAAIQN9/7l1QgAuzwMYUzqeuQzCayJi05HoZHtutK8s5aJnQkEfbhDBCihurFfFcTm2Ey7zwWLmYrjHsilUlzBEudxumxEFL9vp1LEC0ZnuieLXKukJSS2kg6RSuqKXdB26ssIybQACAAEDAAAhAvHQl3j+8ilC6iFnyfMXgvenj4vWzmvQ82Mk/sXJ4WlLQSBFQCVu0WNgrGdUo7Wqj749jXrq4l3jQodVJyKV1uqyDk98WWrnbbOwWXSMvqaHLQToRdgvzRBSz0OLJThjo7WPAfwAEnx1INoQhfd70M3yHVUTMKhQxWMe7ujJx4m3yDXJCRoCml+rAABBH89rKS6/eSP/Qk4HjeIaQoUNclo1RahqvjgWTkoDUyseeBr3xZeSrIHVuiulGw84YNIewbKoAivwETcilqGL/aPqlNEdpfDLSx1he5//GLQnhs2w9HNVQtcsKxsFYtdwqA==',
      timestamp: '2025-03-11T15:32:29.426Z',
      gasUsed: 100908180,
      status: 'SUCCESS',
      error: null,
      owner: {
        identifier: 'Gni1ugX2yQwFouEUPH8rjbgYAEMQ4rXbKXQgqF9s2bh9',
        aliases: [
          {
            alias: 'test-invite-0.dash',
            status: 'ok',
            contested: false,
            timestamp: '2025-03-11T18:32:32.993+03:00'
          }
        ]
      }
    }
  ]
}

export default results
