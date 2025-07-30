```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
404: Not Found
```
___
### Token Transitions
Return list of transitions for token

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET /token/4xd9usiX6WCPE4h1AFPQBJ4Rje6TfZw8kiBzkSAzvmCL/transitions?limit=10&order=desc&page=1
{
    "resultSet": [
        {
            "amount": 2000,
            "recipient": "HxEj8nUyvfuPzDGm9Wif1vWnUaeRcfvfDN1HZxV7q5rf",
            "owner": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
            "action": 2,
            "stateTransitionHash": "432D47C8955424A5E61BD4204A33C2E1FCEB951BED6ED5B2C4B27E05C6433781",
            "timestamp": "2025-07-17T14:08:21.217Z",
            "publicNote": null
        },
        {
            "amount": 0,
            "recipient": "HxEj8nUyvfuPzDGm9Wif1vWnUaeRcfvfDN1HZxV7q5rf",
            "owner": "DTFPLKMVbnkVQWEfkxHX7Ch62ytjvbtqH6eG1TF3nMbD",
            "action": 4,
            "stateTransitionHash": "2F329C99AA7E7C52ABEB2340FFAC098EB19ADDB7B2CC0D5CA3A891B077E12FBB",
            "timestamp": "2025-07-15T14:44:17.346Z",
            "publicNote": null
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": "desc"
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
404: Not Found
```
___
### Tokens Rating
Return list of tokens identifier with order by transactions count

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
* `timestamp_start` and `timestamp_end` can be null and `timestamp_end` must be greater then `timestamp_start` if they are used. Default value is equal to the interval in the past 30 days
```
GET tokens/rating?order=desc&limit=10&page=1&timestamp_start=2025-06-20T17:10:28.585Z&timestamp_end=2025-07-28T20:37:28.585Z
{
    "resultSet": [
        {
            "tokenIdentifier": "8RsBCPSDUwWMnvLTDooh7ZcfZmnRb5tecsagsrdAFrrd",
            "transitionCount": 15,
            {
                "localizations": {
                    "en": {
                        "pluralForm": "A1-keyword",
                        "singularForm": "A1-keyword",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "FWuCZYmNo2qWfLcYsNUnu1LdqBWbzvWBUcGQHRFE2mVt",
                "transitionCount": 1
            },
            {
                "localizations": {
                    "en": {
                        "pluralForm": "A1-test-1",
                        "singularForm": "A1-test-1",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "Eg49SNkMVgo84vGhj89bEK53X2mURGuVSERzteaT1brr",
                "transitionCount": 1
            },
            {
                "localizations": {
                    "en": {
                        "pluralForm": "aaa",
                        "singularForm": "aaa",
                        "shouldCapitalize": true
                    }
                },
                "tokenIdentifier": "8Uv6WJEf7pyw17AtcJpGdURkU3wrmz86RkXxUdNNx575",
                "transitionCount": 2
            },
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 11
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Tokens By Identity
Return list of tokens which created by identity

* Valid `order` values are `asc` or `desc`
* `limit` cannot be more then 100
* `page` cannot be less then 1
```
GET identity/5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5B1/tokens?limit=10&page=1&order=asc
{
    "resultSet": [
        {
            "identifier": "Hqyu8WcRwXCTwbNxdga4CN5gsVEGc67wng4TFzceyLUv",
            "position": 0,
            "timestamp": null,
            "description": "The flurgon contract on testnet",
            "localizations": {
                "en": {
                    "pluralForm": "Flurgons",
                    "singularForm": "Flurgon",
                    "shouldCapitalize": true
                }
            },
            "baseSupply": "10000",
            "totalSupply": "10000",
            "maxSupply": null,
            "owner": "5DbLwAxGBzUzo81VewMUwn4b5P4bpv9FNFybi25XB5Bk",
            "mintable": true,
            "burnable": true,
            "freezable": true,
            "unfreezable": true,
            "destroyable": true,
            "allowedEmergencyActions": true,
            "dataContractIdentifier": "ALybvzfcCwMs7sinDwmtumw17NneuW7RgFtFHgjKmF3A",
            "changeMaxSupply": true,
            "distributionType": "TimeBasedDistribution",
            "totalGasUsed": null,
            "mainGroup": null,
            "totalTransitionsCount": null,
            "totalFreezeTransitionsCount": null,
            "totalBurnTransitionsCount": null,
            "decimals": 0
        },
        ...
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 3
    }
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```
___
### Broadcast Transaction
Send Transaction for Broadcast

* `base64` optional field. State transition buffer in base64
* `hex` optional field. State transition buffer in hex
* You must pass `hex` or `base64`

```
POST /transaction/broadcast
BODY:
{
    "base64": "AgDpAd/Bcqls4/fTNNbAtp3zsByG0w/wOnwk9RaDj5Q0DQEAAAAetrSpdOHzvWhmll5EyXQFOW6JEoHRY2Alb0wBP6ic9AcEbm90ZYpK8hfzQOnEyVhXSWzzO2jrbHEqxtIKHreFTRSv2f/PxVTtZXkupT+mJytiIWsAU0U1Ke1abN0JJvNNU1182eoCBmF1dGhvchIGb3dsMzUyB21lc3NhZ2USBHRlc3QAAAAA"
}

RESPONSE:
{
  "message": "broadcasted"
}
```
Response codes:
```
200: OK
500: Internal Server Error
503: Service Temporarily Unavailable
```