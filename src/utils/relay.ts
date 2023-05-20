// @ts-nocheck
// from github.com/libevm/subway
import fetch from "node-fetch";
import { wss } from "../config";
import { ethers } from 'ethers';

const fbSignerWallet = wss.eth.accounts.create();
const ethersProvider = new ethers.providers.JsonRpcProvider(wss); 
const ethersSignerWallet = new ethers.Wallet(fbSignerWallet.privateKey, ethersProvider);

let _fbId = 1;
async function fbRequest(url, method, params) {
	const body = JSON.stringify({
		method: method,
		params: params,
		id: _fbId++,
		jsonrpc: "2.0"
	});

	const signature = await ethersSignerWallet.signMessage(ethers.utils.id(body)); // web3.js produces different signature than ethers

	const headers = {
		"X-Flashbots-Signature": `${fbSignerWallet.address}:${signature}`,
		"Content-Type": "application/json"
	};

	const resp = await fetch(url, {
		method: "POST",
		headers,
		body
	}).then((x) => x.json());

	return resp;
}

export async function callBundle(signedTxs: string[], targetBlockNumber: number) {
	const params = [
		{
			txs: signedTxs,
			blockNumber: await wss.utils.toHex(targetBlockNumber),
			stateBlockNumber: await wss.utils.toHex(targetBlockNumber-1)
		}
	];
	const resp = await fbRequest(
		"https://relay.flashbots.net",
		"eth_callBundle",
		params
	);

	return resp.result;
}
