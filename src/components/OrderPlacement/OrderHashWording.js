const wording = `##### \`INSERT-ORDER-HASH\`

This hex-encoded hash represents your Order details (economics) in compressed form, used as an identifier in the Exchange (EtherDelta) Smart Contract.

**Please ensure it is this message you sign in MetaMask when prompted**.

##### Raw Order Details


| Field                | Value                                      | Description |
| -------------------- | ------------------------------------------ | ----------- |
| Contract Address | \`INSERT-CONTRACT-ADDR\` | Address of the EtherDelta Smart Contract |
| Token Get | \`INSERT-TOKEN-GET\` | Token you will get (INSERT-TOKEN-GET-NAME) |
| Amount Get | \`INSERT-AMOUNT-GET\` | Amount of INSERT-TOKEN-GET-NAME you will get in wei |
| Token Give | \`INSERT-TOKEN-GIVE\` | Token you will give (INSERT-TOKEN-GIVE-NAME) |
| Amount Get | \`INSERT-AMOUNT-GIVE\` | Amount of INSERT-TOKEN-GIVE-NAME you will give in wei |
| Expires | \`INSERT-EXPIRES\` | Order will expire on this block |
| Nonce | \`INSERT-NONCE\` | The Nonce is used to distinguish orders with the same economics and is randomly generated |
`
export default wording