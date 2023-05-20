interface strategy {
  id: string;
  address: string;
}

export const ousdStrats: strategy[] = [
	{
		id: "aave",
		address: "0x5e3646A1Db86993f73E6b74A57D8640B69F7e259"
	},
	{
		id: "compound",
		address: "0x9c459eeb3FA179a40329b81C1635525e9A0Ef094"
	},
	{
		id: "cvx-3crv",
		address: "0xEA2Ef2e2E5A749D4A66b41Db9aD85a38Aa264cb3"
	},
	{
		id: "cvx-lusd-3crv",
		address: "0x7A192DD9Cc4Ea9bdEdeC9992df74F1DA55e60a19"
	},
	{
		id: "morpho-compound",
		address: "0x5A4eEe58744D1430876d5cA93cAB5CcB763C037D"
	},
	{
		id: "cvx-ousd-3crv",
		address: "0x89Eb88fEdc50FC77ae8a18aAD1cA0ac27f777a90"
	},
	{
		id: "morpho-aave",
		address: "0x79F2188EF9350A1dC11A062cca0abE90684b0197"
	}
];
