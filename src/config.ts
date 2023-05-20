import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.WSS_RPC || !process.env.WSS_RPC.startsWith("ws")) {
	throw new Error("WSS_RPC missing in .env");
}

/*if (!process.env.BRIBE_PCT) {
	throw new Error("BRIBE_PCT missing in .env");
}*/

if (!process.env.MIN_PROFIT) {
	throw new Error("MIN_PROFIT missing in .env")
}

if (!process.env.PRIVATE_KEY) {
	throw new Error("PRIVATE_KEY missing in .env");
}

export const mevBlocker = new Web3("https://rpc.mevblocker.io/noreverts");
export const wss = new Web3(process.env.WSS_RPC);

export const HELPER_ADDRESS = "0x4aa8ff1895f8decc900d731f94343dab5d3f162f"; // see contracts/helper.sol 
export const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const HARVESTER_ADDRESS = "0x21Fb5812D70B3396880D30e90D9e5C1202266c89";

export const V2_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const USDT_ETH_PATH = ["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"];

//export const BRIBE_PCT = parseFloat(process.env.BRIBE_PCT);
export const MIN_PROFIT = parseFloat(process.env.MIN_PROFIT);

export const bot_private_key = process.env.PRIVATE_KEY;
