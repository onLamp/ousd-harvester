import { BlockHeader } from "web3-eth";

/*export function bribeToGwei(BRIBE_PERCENT: number, ETH_REWARD: number, GAS_USED: number) {
	const availReward = Math.floor(ETH_REWARD * BRIBE_PERCENT);
	const gwei = Math.floor((availReward / (GAS_USED * 1e9)) * 1e9);

	const expectedCost = gwei * GAS_USED;
	const expectedProfit = availReward - expectedCost;

	return { gweiBribe: gwei, cost: expectedCost, profit: expectedProfit };
}*/

// from github.com/libevm/subway
export function calcNextBlockBaseFee(block: BlockHeader) {
	if (!block.baseFeePerGas) throw new Error("calcNextBlockBaseFee(): block missing baseFeePerGas property");

	const baseFee = block.baseFeePerGas;
	const gasUsed = block.gasUsed;
	const targetGasUsed = block.gasLimit/2;
	const delta = gasUsed-(targetGasUsed);

	return baseFee + (baseFee*(delta)/(targetGasUsed)/(1e9));
}

