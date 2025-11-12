# CHANGELOG

### v2.1.1
## Changes

## API

- TokenPaymentInfo for transaction decode @owl352 (#671)
- Tokens Holders @owl352 (#661)
- Fix waitForStateTransitionResult route path @pshenmic (#682)
- API method waitForStateTransitionResult @owl352 (#675)
- Remove alias contested resource vote poll check for identities list @owl352 (#680)
- Fix tokens balance is null for identities @owl352 (#676)

### v2.1.0

## Changes

## API

- Fix public keys naming @owl352 (#670)
- Fix identity credit withdrawal decode  @owl352 (#660)
- Fix Identity Public Keys  @owl352 (#659)
- Fix deleted documents data @owl352 (#657)
- Fix revision list for document details @owl352 (#656)
- Memory leaks fix @owl352 (#650)
- Fix transaction\_type enum in routes schema @owl352 (#651)
- Index token interactions for transfers @owl352 (#646)
- Tokens search  @owl352 (#647)
- Validators optimization @owl352 (#648)
- Fix batch action for identity transactions @owl352 (#645)

## Frontend

- Fix IdentityPublicKey data not shown @t1mee (#668)
- Add recipient in document transition card @AlexeyTripleA (#655)


### v2.0.0

## Changes

## API

- Tokens owner format fix @owl352 (#641)
- Quorum Info Endpoint @owl352 (#643)
- Expand distribution info in tokens @owl352 (#634)
- Identities with owned tokens @owl352 (#635)
- Fix batch enum @owl352 (#640)
- Fix transitions type for document revisions and token transitions @owl352 (#637)
- Identity Tokens Balances @owl352 (#632)
- Tokens trends list alghoritm update @owl352 (#626)
- Batch type filter for transactions list @owl352 (#624)
- Transaction types in string @owl352 (#623)
- Token transitions in Data Contract transitions @owl352 (#617)
- Tests fix for api @owl352 (#621)
- Tokens By Identity @owl352 (#619)
- Tokens rating `timestamp_start` and `timestamp_end` @owl352 (#620)
- Tokens rating @owl352 (#618)
- Token Decimals @owl352 (#615)
- Token by identifier @owl352 (#611)
- Query optimizations @owl352 (#609)
- Fix for data contract deserialization @owl352 (#608)

## Frontend

- Implement token prices display @AlexeyTripleA (#642)
- Implement a tokens list on the data contract page @AlexeyTripleA (#638)
- Feat/token distribution format @AlexeyTripleA (#639)
- Refactoring batch types @AlexeyTripleA (#636)
- Add balance field to tokens list @AlexeyTripleA (#633)
- Fix api link in navbar @AlexeyTripleA (#629)
- Implement a list of tokens on the Identity page @AlexeyTripleA (#627)
- Update transactions types format on the frontend @AlexeyTripleA (#625)
- Token list and details @AlexeyTripleA (#580)
- Improve transactions list @AlexeyTripleA (#614)
- Data Contract's groups @AlexeyTripleA (#616)
- Add emergency action value in transition card @AlexeyTripleA (#612)
- Fix mobile filter menu @AlexeyTripleA (#613)

## Indexer

- Fix purchase token amount in token transitions @owl352 (#644)
- Token transitions in Data Contract transitions @owl352 (#617)

### v1.0.29

## Changes

## API

-  Remove drop database step from CI @pshenmic (#607)
- Integration of pshenmic-dpp @owl352 (#598)
- New algoritm for transactions query @owl352 (#603)
- Experimental optimization improvments and fixes @owl352 (#602)
- Experimental optimization for Blocks and Transactions @owl352 (#601)

## Indexer

-  Remove drop database step from CI @pshenmic (#607)


### v1.0.28

## Changes

## API

- Tokens List @owl352 (#597)
- Fix timestamp in tests @owl352 (#582)
- Last epoch endpoint @owl352 (#559)
- Withdrawals documents skip parameters @owl352 (#566)
- Add BatchType to state transitions @pshenmic (#579)
- Fix naming for token transitions @owl352 (#574)
- More fields for decoded token transitions @owl352 (#573)
- Decode Token Transitions @owl352 (#572)

## Frontend

- Implement links to nearby blocks @AlexeyTripleA (#596)
- Fix ValueContainer props warning @AlexeyTripleA (#586)
- Fix column title in search result list block title @AlexeyTripleA (#595)
- Improve filter logic @AlexeyTripleA (#590)
- Fix validator statistics API methods @AlexeyTripleA (#585)
- Token transactions details @AlexeyTripleA (#575)

## Indexer

- Prefix dpp \& data contracts platform modules to git @pshenmic (#600)
- Tokens List @owl352 (#597)
- Indexer refactor @owl352 (#565)
- Fix token amount is optional @pshenmic (#584)
- Fix token receiver is optional @pshenmic (#583)
- Add BatchType to state transitions @pshenmic (#579)
- Change document owner to field type to varchar @owl352 (#571)
- Indexer tokens support @owl352 (#483)


### v1.0.27

## Changes

## API

- First quorum info fix @owl352 (#570)

### v1.0.26

## Changes

## API

- Fields naming fix in Epoch status  @owl352 (#564)

## Frontend

- Reduce maximum width of page content @AlexeyTripleA (#567)
- Update global layout @AlexeyTripleA (#558)
- Create Masternode Votes page @AlexeyTripleA (#556)

### v1.0.25

## Changes

New page: Contested Resources

## API

- Contested resource fix @owl352 (#560)

### v1.0.24

## Changes

## Frontend

- Absolute timestamp in Block list @AlexeyTripleA (#546)

### v1.0.23

## Changes

## Frontend

- Add hover on timestamps @AlexeyTripleA (#544)

### v1.0.22

## Changes

## Frontend

- Update validator field in block page @AlexeyTripleA (#541)
- Add hover animation to status in transactions list @AlexeyTripleA (#542)
- Improve search @AlexeyTripleA (#538)
- Improve blocks page @AlexeyTripleA (#539)

### v1.0.20

## Changes

## Frontend

- Add tooltip to status icon in transactions list @AlexeyTripleA (#537)
- Implement filters on transactions page @AlexeyTripleA (#517)
- Fix transaction status in Search @AlexeyTripleA (#536)


### v1.0.19

## Changes

## Indexer

- Bump dashcore-rpc @owl352 (#535)

### v1.0.18

## Changes

## API

- Rename identity contract nonce in Identity Updated transition @owl352 (#530)
- Rename `identityNonce` in document to `contractNonce`  @owl352 (#529)
- Fix documentation for decode and some naming fixes @owl352 (#518)
- Fix API Test @owl352 (#526)
- Transactions `totalCount` fix and filter by timestamp @owl352 (#525)
- Broadcast transaction in hex @owl352 (#514)
- Fixes for search response and new fields for search response @owl352 (#516)
- Search Block field renamed to Blocks in response @owl352 (#515)
- Statistics for graphs query optimization @owl352 (#500)
- Api power for masternode votes @owl352 (#503)
- Fix documents raw buffer @owl352 (#513)
- Raw data contract by identifier from DAPI @owl352 (#511)
- Raw documents by identifier from DAPI @owl352 (#510)
- Add raw public key to identity @owl352 (#508)
- Fix BigInt for identity balance @owl352 (#507)
- Implement BigInt conversions after #505 PR @owl352 (#506)
- Broadcast transaction and identity nonce queries @owl352 (#505)
- Search route improvements and tests fix @owl352 (#502)
- SDK Version bump @owl352 (#504)
- Dapi get documents method architecture fix @owl352 (#498)

## Frontend

- Rename nonce fields @AlexeyTripleA (#528)
- Remove identity contract nonce from document page @AlexeyTripleA (#524)
- Vertical alignment of PublicKeysListItem @AlexeyTripleA (#523)
- Improve identifier component @AlexeyTripleA (#466)
- Disable Christmas event in BlocksTotal @AlexeyTripleA (#520)
- Update api urls in docs @AlexeyTripleA (#519)
- Improve global search @AlexeyTripleA (#497)
- Update data points count in charts @AlexeyTripleA (#490)
- Update render of new format fields @AlexeyTripleA (#512)
- Make creation date clickable @AlexeyTripleA (#496)
- Update total cards styles @AlexeyTripleA (#491)

## Indexer

- Indexer SQL transactions @owl352 (#501)
- Power Column for Indexer @owl352 (#489)

### v1.0.17

## Changes

## API

- API 500 on bad validator host @owl352 (#487)
- Invalid filter in #493 @owl352 (#494)
- Incorrect quorum index calculation @owl352 (#493)
- Documents revisions fix @owl352 (#474)
- Use specific quorum type in block query @owl352 (#488)
- Quorum block height field @owl352 (#478)
- Contested Documents List API @owl352 (#462)

## Frontend

- Fix date range picker active range @AlexeyTripleA (#455)
- Improve Block page @AlexeyTripleA (#468)
- Update field title in TransitionCard @AlexeyTripleA (#486)
- Fix tab style @AlexeyTripleA (#477)
- Fix transfers list columns size @AlexeyTripleA (#476)
- Update documents data render @AlexeyTripleA (#475)

## Indexer

- Document revision increment after purchase @owl352 (#495)


### v1.0.16

## Changes

## API

- Documents owner structure in Documents by identity @owl352 (#473)
- Total gas used @owl352 (#460)
- Fix empty transactions for data contract @owl352 (#469)
- Order fix for data contract transactions @owl352 (#459)
- Data Contracts document count fix and identities aliases @owl352 (#465)
- Fix for Resource Value convertation @owl352 (#463)
- Documents owner aliases @owl352 (#458)
- Contested Resource API @owl352 (#451)
- Data contract transactions and some additional fields @owl352 (#453)
- Gas used field for document revisions @owl352 (#456)

## Frontend

- Add total gas used field on pages @AlexeyTripleA (#472)
- Improve document page @AlexeyTripleA (#449)
- Improve Datacontract page @AlexeyTripleA (#447)
- Fix alias render in document info @AlexeyTripleA (#464)
- Update Owner field render @AlexeyTripleA (#461)

### v1.0.15

## Changes

## API

- Interval count fix for graphs @owl352 (#450)

## Frontend

- Improve charts render @AlexeyTripleA (#452)

### v1.0.14

## Changes

## Frontend

- Fix timespan title in chart on the Home page @AlexeyTripleA (#446)

### v1.0.13

## Changes

## Frontend

- Fix non-existent component bug @AlexeyTripleA (#444)

### v1.0.12

## Changes

## API

- Masternodes Votes API @owl352 (#425)
- New fields for documents and list of documents by document type @owl352 (#406)
- Naming fix for decoded MN vote TX @owl352 (#441)
- Update price field price API  @owl352 (#440)
- Receiver Id and Purchase price API @owl352 (#439)
- Fix of documents from dapi search and documentation  @owl352 (#432)
- Entropy error fix @owl352 (#426)
- Document Batch Action Enum fix @owl352 (#411)
- Quorums and DashcoreRPC code duplication fixes @owl352 (#410)
- Blocks list filters and `totalGasUsed` field @owl352 (#365)
- Aliases structure fix @owl352 (#409)
- Decoded Document Batch Tx Nonce @owl352 (#408)
- Indexer syncing progress for `/status` @owl352 (#403)
- Entropy field for Documents batch  @owl352 (#394)
- Aliases timestamps @owl352 (#384)
- Nonce and version for decoded state transitions @owl352 (#377)
- Documents from DAPI @owl352 (#322)
- Quorum info for specific block route @owl352 (#364)
- `setPublicKeyIdsToDisable` error fix @owl352 (#405)

## Frontend

- Improve Transaction page @AlexeyTripleA (#436)
- Improve Data Contracts page @AlexeyTripleA (#438)
- Update transactions chart format @AlexeyTripleA (#431)
- Implement time update function @AlexeyTripleA (#424)
- Update pagination styles @AlexeyTripleA (#420)
- Improve charts on the Validator page @AlexeyTripleA (#430)
- Refactoring code of theme.js @AlexeyTripleA (#428)
- Fix transaction breadcrumbs @AlexeyTripleA (#427)
- Update smooth size container @AlexeyTripleA (#421)
- Remove trailing zeros @AlexeyTripleA (#423)
- Update documents request to api @AlexeyTripleA (#433)
- Fix pagination of lists on the Identity page @AlexeyTripleA (#435)
- Disable Christmas elements @AlexeyTripleA (#422)
- Set current year in footer dynamically @AlexeyTripleA (#417)
- Fix scrollbar of public keys list @AlexeyTripleA (#416)
- Fix document action enum @AlexeyTripleA (#415)
- Fix pagination of documents on Identity page @AlexeyTripleA (#404)

## Indexer

- Fix indexer block header typo @pshenmic (#443)
- Add app hash in the indexer @pshenmic (#437)
- Index prefunded voting balance in the documents @pshenmic (#434)
- Add WalletUtils contract  @pshenmic (#429)
- Masternode votes in the indexer @pshenmic (#418)

### v1.0.11

## Changes

## API

- Aliases status fix @owl352 (#395)

## Frontend

- Fix nested link warning @alexeyandreevsky (#393)
- Remove Alias status Tooltip in lists @alexeyandreevsky (#396)
- Update description on Identities page @alexeyandreevsky (#397)

### v1.0.10

### Changes

## API

- Aliases status fix @owl352 (#392)
- Identity Public keys structure fix @owl352 (#382)
- Add document transition type and document type name @pshenmic (#373)
- Identity topUps and withdrawals amount @owl352 (#378)

## Frontend

- Update Aliases status @alexeyandreevsky (#391)
- Improve transaction page @alexeyandreevsky (#338)
- Update pagination styles @alexeyandreevsky (#387)
- Update back button @alexeyandreevsky (#363)
- Embed pshenmic logo in footer @alexeyandreevsky (#388)
- Update Identifiers styles on the specific Validator page @alexeyandreevsky (#386)
- Update tabs style @alexeyandreevsky (#385)
- Improve documents list @alexeyandreevsky (#369)
- Identity page hotfixes @alexeyandreevsky (#383)
- Improve Identity page @alexeyandreevsky (#327)
- Global search fix @alexeyandreevsky (#381)
- Improve network status check @alexeyandreevsky (#380)

## Indexer

- Indexer hotfixes @pshenmic (#390)
- Add document transition type and document type name @pshenmic (#373)

### v1.0.9

## Changes

Xmas Theme, Validator Rewards Chart, Clock with timezone and many small improvements

## API

- User fee increase for the MasternodeVote in decodeStateTransition @owl352 (#347)
- Identity and transfer fields fix @owl352 (#370)
- Transaction decode nonce error fix @owl352 (#375)
- Status versions from DAPI @owl352 (#366)
- Packages versions fix @owl352 (#367)
- New fields for identities @owl352 (#357)
- New logic for search in API @owl352 (#356)
- Transactions gas history series @owl352 (#358)
- CI deploy for testnet fix @owl352 (#352)
- Add transaction model in blocks route @owl352 (#349)
- Transactions filters @owl352 (#321)
- Validator By Identity Endpoint @owl352 (#348)
- Target branch rule for lint action @owl352 (#346)
- Aliases status fix @owl352 (#335)
- MasternodeVote proTxHash @owl352 (#333)
- Withdrawals output address and document id field @owl352 (#332)
- Public Keys Structure Improvments @owl352 (#331)
- AssetLockProof structure improvments @owl352 (#330)
- Expanding decoding response for transactions @owl352 (#312)
- Replaced status for withdrawals from number to string @owl352 (#319)
- API container paths fix @owl352 (#317)
- Withdrawals data from dapi @owl352 (#313)
- Charts generation improvments @owl352 (#310)
- Validator rewards statistic @owl352 (#300)
- Rollback to the previous dapi client initialization method @owl352 (#314)
- Aliases with ContestedResourceVoteState @owl352 (#306)
- Incorrect timeout error @owl352 (#297)
- Upgrade to Dash Platform v1.5.1 @pshenmic (#303)
- Fix for search query @owl352 (#291)
- Decode error with null `outputScript` @owl352 (#290)
- CI deploy for testnet fix @owl352 (#352)

## Frontend

- Update versions render in NetworkStatus @alexeyandreevsky (#376)
- Implement Christmas elements @alexeyandreevsky (#361)
- Fix LocalTime render @alexeyandreevsky (#362)
- Implement Rewards Chart on validator page @alexeyandreevsky (#326)
- Update transactions list format @alexeyandreevsky (#374)
- Transactions list on block page @alexeyandreevsky (#344)
- Fix transactions list on home page @alexeyandreevsky (#336)
- Add tooltip to withdrawals status @alexeyandreevsky (#337)
- Home page styles update @alexeyandreevsky (#355)
- Implement clock and time zone info in Footer @alexeyandreevsky (#353)
- Frontend bug fix @alexeyandreevsky (#334)
- Implement a list of withdrawals on the validator page @alexeyandreevsky (#307)
- Update transactions page @alexeyandreevsky (#305)
- Breadcrumb Implementation @alexeyandreevsky (#309)
- Add status state for Alias @alexeyandreevsky (#318)
- Improve transaction page @alexeyandreevsky (#311)
- Implement Tables in Markdown @alexeyandreevsky (#329)
- Add support for old alias format @alexeyandreevsky (#316)
- Update alias display for new format @alexeyandreevsky (#315)
- Implement date range picker in validator proposed blocks chart @alexeyandreevsky (#298)
- Fix network selector @alexeyandreevsky (#293)
- Update Validator page @alexeyandreevsky (#296)
- Implement identities aliases in Top Identities cards @alexeyandreevsky (#292)
- Update the render endpoint error state @alexeyandreevsky (#294)
- Implement "All" option for items on page selector in the validators list @alexeyandreevsky (#295)
- Fix platform node id reference @pshenmic (#289)

## Indexer

- Add transaction hash in the identity names @pshenmic (#368)
- Target branch rule for lint action @owl352 (#346)
- Upgrade to Dash Platform v1.5.1 @pshenmic (#303)

### v1.0.8

## Changes

- Implement document transfers \& purchases in the indexer @pshenmic (#270)

## API

- Upgrade to Dash Platform v1.4.0-dev.8 @pshenmic (#274)
- USD rate  @owl352 (#261)
- Total collected fees in the past day @owl352 (#260)
- Identities sort by balance test fix @owl352 (#257)
- Default value for epoch on Tenderdash error in /status @owl352 (#258)
- Tests for epochs @owl352 (#255)
- Case sensitivity in search @owl352 (#253)
- Auto publish release @owl352 (#256)
- Upgrade to platform v1.3.0 @pshenmic (#263)
- Identity field for Validators @owl352 (#254)

## Frontend

- Redesign common elements @alexeyandreevsky (#269)
- Fix state switch handler in validators list @alexeyandreevsky (#266)
- Implement a new design for the validators page on the frontend @alexeyandreevsky (#259)
- Auto publish release @owl352 (#256)
- Implement new data on frontend @alexeyandreevsky (#247)


### v1.0.7

## Changes

- Implement document transfers \& purchases in the indexer @pshenmic (#270)

## API

- Upgrade to Dash Platform v1.4.0-dev.8 @pshenmic (#274)
- USD rate  @owl352 (#261)
- Total collected fees in the past day @owl352 (#260)
- Identities sort by balance test fix @owl352 (#257)
- Default value for epoch on Tenderdash error in /status @owl352 (#258)
- Tests for epochs @owl352 (#255)
- Case sensitivity in search @owl352 (#253)
- Auto publish release @owl352 (#256)
- Upgrade to platform v1.3.0 @pshenmic (#263)
- Identity field for Validators @owl352 (#254)

## Frontend

- Redesign common elements @alexeyandreevsky (#269)
- Fix state switch handler in validators list @alexeyandreevsky (#266)
- Implement a new design for the validators page on the frontend @alexeyandreevsky (#259)
- Auto publish release @owl352 (#256)
- Implement new data on frontend @alexeyandreevsky (#247)


### v1.0.6

## Changes

- Revert base64 check for masternode identities @pshenmic (#252)


### v1.0.5

## Changes

- Add validator's identities in the indexer @pshenmic (#249)

## API

- Query epoch from DAPI @owl352 (#250)

## Frontend

- Improve mobile menu @alexeyandreevsky (#243)
- Update validators list filter @alexeyandreevsky (#248)


### v1.0.4

## Changes

- Do not create system identities @pshenmic (#246)

## API

- Fix for default dapi address @owl352 (#245)
- Add platform total credits API in the status @owl352 (#224)
- Fetch Identity balance from DAPI GRPC @owl352 (#227)
- Removed case sensitivity for hash @owl352 (#240)

## Frontend

- Update network selector @alexeyandreevsky (#244)


### v1.0.3

Homepage major redesign

## Changes

## Frontend

- Implement new design of the Home Page on frontend @alexeyandreevsky (#225)

### v1.0.1

Upgrade to Dash Platform v1.1.0

## Changes

## API

- Upgrade to Dash Platform v1.1.0 @pshenmic (#237)

### v1.0.0

First release where we start noting changes

## Changes

- Data contract utility update  @owl352 (#205)
- API container size reduce @owl352 (#213)
- Upgrade identity aliases to one-to-many @pshenmic (#219)
- Indexer size reduction and migrations path fix @owl352 (#212)
- Add repo checkout to deploy action @owl352 (#211)
- Fix incorrect volume mount in the migrations container @owl352 (#210)
- Pass migations as a volume in the migrations container @owl352 (#209)
- Multi stage docker build @owl352 (#206)
- Fix footer position issue @denkravchu (#201)
- Change BASE\_URL to TENDERDASH\_URL @pshenmic (#199)
- Revert "Add average TPS per epoch endpoint" @pshenmic (#179)
- Handle Tenderdash RPC race condition \& always restart @pshenmic (#172)
- Fix timeframe cache in firefox @alexeyandreevsky (#150)
- Initial PE Data Contract @owl352 (#140)
- Refactor block\_results function @pshenmic (#149)
- Add DPNS names (identity aliases) @pshenmic (#142)
- Parse transaction fee and transaction status from block results @pshenmic (#141)
- Parse identity balance from ChainLock @pshenmic (#137)
- Add data\_contract\_id index @pshenmic (#131)
- Add `identifier` and `owner` columns indexes @pshenmic (#130)
- Add conditional setting data from fetch @alexeyandreevsky (#127)
- Fix chart render bug @alexeyandreevsky (#126)
- Parse initial identity balance from L1 transaction assetlock @pshenmic (#125)
- Create transactions page @alexeyandreevsky (#115)
- Add configuration to skip certain transactions @pshenmic (#88)
- Migrate owner to the state transitions @pshenmic (#72)
- Add data contracts and document owners @pshenmic (#71)
- Implement all Identities state transitions @pshenmic (#70)
- Implement DocumentsBatchTransition @pshenmic (#62)
- Implement DataContractUpdate state transition @pshenmic (#61)
- Add schema to the data contracts @pshenmic (#58)
- Improve database schema @pshenmic (#57)
- Persist blocks and state transitions in the database @pshenmic (#45)
- Add indexer dockerfile @pshenmic (#43)
- Add postgres processor @pshenmic (#42)
- Upgrade to v25 @pshenmic (#40)
- Bootstrap indexer module @pshenmic (#35)
- Fix RPC timeout for old devices @pshenmic (#33)
- Add block transactions @pshenmic (#17)
- Add async transaction state transaction decoding @pshenmic (#16)
- Add mobile responsive layout @pshenmic (#15)
- Decode state transition on the backend @pshenmic (#14)
- Implement caching @pshenmic (#7)
- Implement search @pshenmic (#9)
- Implement blocks pagination @pshenmic (#10)

## API

- Upgrade to Dash Platform v1.1.0 @pshenmic (#237)
- Information on the best validator for the no-transaction epoch @owl352 (#223)
- Implement release flow (CI) @owl352 (#204)
- The total number of identities on /status endpoint @owl352 (#226)
- Upgrade API to the Dash SDK v1.0.0-rc.2 @pshenmic (#218)
- Removing an duplicated if block in a search @owl352 (#216)
- Search Identity by DPNS name @owl352 (#197)
- Handle legacy masternodes in the protx info call @owl352 (#208)
- Upgrade to Dash Platform beta 4 @pshenmic (#198)
- Validation layer to the API @owl352 (#195)
- IP address / Port for Validator @owl352 (#192)
- Fees collected by the epoch and best validator @owl352 (#188)
- Endpoint to get statistics on proposed blocks for validators @owl352 (#169)
- Add epoch by index endpoint @owl352 (#180)
- Add average TPS per epoch endpoint @owl352 (#167)
- Fix proTxHash was not underscored from TD RPC + tests @pshenmic (#174)
- Implement isActive validators filter @pshenmic (#163)
- Extend returning info in the getValidators() API @owl352 (#161)
- Implementation of getBlocksByValidator() @owl352 (#156)
- Add block hash in the /status route @pshenmic (#159)
- Implement custom data contract names @pshenmic (#153)
- Add tenderdash block timestamp in the status @pshenmic (#148)
- Refactor /status endpoint @pshenmic (#145)
- Add transaction fee, status and error message @pshenmic (#143)
- Fix getIdentities route slowdown @pshenmic (#134)
- Add prometheus metrics @pshenmic (#129)
- Add documents count in the data contract lists @pshenmic (#122)
- Add validators support @pshenmic (#119)
- Implement sort-by for data contracts and identities @pshenmic (#121)
- Add epoch info in the getStats API @pshenmic (#114)
- Add transaction history API @pshenmic (#120)
- Enforce Javascript Standard linting rules @pshenmic (#116)
- [Perf] Remove postgres from prod instance @pshenmic (#118)
- Upgrade to platform 1.0.0-dev.10 @pshenmic (#113)
- Add API integration tests @pshenmic (#92)
- Add owner field to the Identities, DataContracts, Documents @pshenmic (#95)
- Fix indexer for dash-testnet-35 @pshenmic (#83)
- Add timestamp to transfers @pshenmic (#80)
- Fix decoding state transition API @pshenmic (#79)
- Add list of identities retrieval API method @pshenmic (#76)
- Extend home page statistics @pshenmic (#75)
- Extend Identities API routes @pshenmic (#74)
- Add get identity by identifier API @pshenmic (#73)
- Implement pagination on the API @pshenmic (#65)
- Migrate API to postgres @pshenmic (#55)
- Refactor backend @pshenmic (#46)
- Do not copy yarn lock @pshenmic (#38)
- Upgrade DashSDK to v25 @pshenmic (#37)

## Frontend

- Implement release flow (CI) @owl352 (#204)
- Improve search component on frontend @alexeyandreevsky (#217)
- Fix chart size @alexeyandreevsky (#215)
- Implement chart for validator activity (proposed blocks) @alexeyandreevsky (#214)
- Fonts update to Dash brand fonts @alexeyandreevsky (#207)
- Add ability to resize of the data contract schema @alexeyandreevsky (#191)
- Implement anchor links @alexeyandreevsky (#166)
- Update the PE data contract in the featured block @alexeyandreevsky (#202)
- Fix a client-side bug in the NetworkStatus component @alexeyandreevsky (#200)
- Add new Footer design @denkravchu (#189)
- Add new data to transaction info @alexeyandreevsky (#185)
- Beautify transaction types titles @alexeyandreevsky (#168)
- Update empty list messages style @alexeyandreevsky (#186)
- Add network selector @denkravchu (#190)
- Fix display errors in the NetworkStatus @alexeyandreevsky (#196)
- Update Validators list styles @alexeyandreevsky (#175)
- Implement Validators on frontend @alexeyandreevsky (#152)
- Add new data contracts to the cards block @alexeyandreevsky (#164)
- Add introduction block on pages @alexeyandreevsky (#136)
- Fix network status timer @alexeyandreevsky (#160)
- Fix latest block field in the network status @alexeyandreevsky (#158)
- Implement auto refresh Network Status @alexeyandreevsky (#151)
- Search handler fix @alexeyandreevsky (#155)
- Implement custom data contract names @pshenmic (#153)
- Improve network status block @alexeyandreevsky (#147)
- Fix list navigation @alexeyandreevsky (#139)
- Implement async data load and error messages @alexeyandreevsky (#135)
- Implement async fetch loading on the Home page @alexeyandreevsky (#133)
- Add condition for chart display @alexeyandreevsky (#132)
- Fix setting data after fetch error @alexeyandreevsky (#128)
- Add linter for frontend package @alexeyandreevsky (#124)
- Improve home page @alexeyandreevsky (#107)
- Fix sorting by documents count implementation @pshenmic (#123)
- Update modal window styles @alexeyandreevsky (#101)
- Fix lists bug @alexeyandreevsky (#108)
- Show system flag and owner @alexeyandreevsky (#104)
- Decode identity credit withdrawals data @alexeyandreevsky (#103)
- Fix mobile menu on medium resolution @alexeyandreevsky (#106)
- Create basic API documentation page @alexeyandreevsky (#98)
- Fix empty blocks list error @alexeyandreevsky (#100)
- Move to Next.js @alexeyandreevsky (#97)
- Fix text wrap styles @alexeyandreevsky (#87)
- Extend the displaying of transaction info @alexeyandreevsky (#82)
- Extend home page stats @alexeyandreevsky (#78)
- Displaying transfers info @alexeyandreevsky (#81)
- Redesign + Identities @alexeyandreevsky (#77)
- Add pagination for documents list @alexeyandreevsky (#66)
- Add page size on blocks page @alexeyandreevsky (#63)
- Implement documents on the frontend @alexeyandreevsky (#64)
- Improve tx and block lists designs @alexeyandreevsky (#60)
- Add metadata fields on home and blocks pages @pshenmic (#56)
- Add data contracts page @pshenmic (#59)
- Migrate API to postgres @pshenmic (#55)
