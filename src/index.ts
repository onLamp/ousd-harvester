import { wss, bot_private_key, mevBlocker, USDT_ADDRESS, HELPER_ADDRESS, HARVESTER_ADDRESS, USDT_ETH_PATH, V2_ROUTER_ADDRESS, MIN_PROFIT } from "./config";
import { calcNextBlockBaseFee } from "./utils/utils";
import { callBundle } from "./utils/relay";
import { AbiItem } from "web3-utils";
import { ousdStrats } from "./data/strategies";
import logger from "node-color-log";

import ERC20_ABI from "./data/abi/ERC20_ABI.json";
import HARVESTER_ABI from "./data/abi/HARVESTER_ABI.json";
import V2_ROUTER_ABI from "./data/abi/V2_ROUTER_ABI.json";
import HELPER_ABI from "./data/abi/HELPER_ABI.json";

(async () => {
  const BOT_ACCOUNT = await wss.eth.accounts.privateKeyToAccount(bot_private_key);
  const BOT_ADDRESS = BOT_ACCOUNT.address;

  const HELPER_CONTRACT = await new wss.eth.Contract(HELPER_ABI as AbiItem[], HELPER_ADDRESS);
  const HARVEST_CONTRACT = await new wss.eth.Contract(HARVESTER_ABI as AbiItem[], HARVESTER_ADDRESS);
  const V2_ROUTER = await new wss.eth.Contract(V2_ROUTER_ABI as AbiItem[], V2_ROUTER_ADDRESS);
  const USDT_CONTRACT = await new wss.eth.Contract(ERC20_ABI as AbiItem[], USDT_ADDRESS);

  wss.eth
    .subscribe("newBlockHeaders", function (error) {
      if (error) {
        console.log(error);
      }
    })
    .on("data", async function (block) {
      try {
        const targetBlock = block.number + 1
        const nextBaseFee = Math.ceil(await calcNextBlockBaseFee(block));
        const nonce = await wss.eth.getTransactionCount(BOT_ADDRESS);
        const usdt_bal = parseInt(await USDT_CONTRACT.methods.balanceOf(BOT_ADDRESS).call());

        logger.debug(`Block ${block.number} -> ${targetBlock} | NBF: ${nextBaseFee / 1e9} GWEI --->`);

        ousdStrats.forEach(async (strat) => {
          try {
            const testRewardCalldata = await HELPER_CONTRACT.methods.getCallReward(USDT_ADDRESS, HARVESTER_ADDRESS, HARVEST_CONTRACT.methods.harvestAndSwap(strat.address, BOT_ADDRESS).encodeABI(), BOT_ADDRESS).encodeABI();
            const usdtReward = await wss.utils.hexToNumber(await wss.eth.call({ to: HELPER_ADDRESS, data: testRewardCalldata, from: BOT_ADDRESS })) as number;
            
            // Only simulate tx if reward > 5 USDT
            if (usdtReward / 1e6 > 5) {
              const testBundleCallData = await HELPER_CONTRACT.methods.randallAteMySandwich_dbohban(usdtReward, strat.address).encodeABI();
              const testCallBundle = await BOT_ACCOUNT.signTransaction({
                to: HELPER_ADDRESS,
                gas: 1000000,
                gasPrice: nextBaseFee + 5e9,
                data: testBundleCallData,
              });

              const testBundleRes = await callBundle([testCallBundle.rawTransaction as string], targetBlock);

              // Simulation didn't fail
              if (testBundleRes) {
                const gasUsed = Math.ceil(testBundleRes.results[0].gasUsed * 1.03); // sim gas slightly off

                const usdtToEthAmtOut = await V2_ROUTER.methods.getAmountsOut(usdtReward, USDT_ETH_PATH).call();
                const ethReward = usdtToEthAmtOut[1];
                
                const cost = gasUsed * (nextBaseFee + 5e8); // bribe 0.5 gwei
                const profit = ethReward - cost;

                logger.info(`${strat.id}: [ PROFIT: ${profit / 1e18} ETH | COST: ${cost / 1e18} ETH | REWARD: ${usdtReward / 1e6} USDT | REWARD IN ETH: ${ethReward / 1e18} ]`);

                if (profit / 1e18 >= MIN_PROFIT) {
                  const expectedReward = (usdt_bal + usdtReward - 1).toString();

                  const callData = await HELPER_CONTRACT.methods.randallAteMySandwich_dbohban(expectedReward, strat.address).encodeABI();

                  const signedTx = await BOT_ACCOUNT.signTransaction({
                    from: BOT_ADDRESS,
                    to: HELPER_ADDRESS,
                    gas: 1000000,
                    gasPrice: nextBaseFee + 5e8,
                    data: callData,
                    nonce: nonce,
                  });

                  mevBlocker.eth.sendSignedTransaction(signedTx.rawTransaction as string);

                  logger.success(`Sent harvest TX for ${strat.id}`);
                } 
              } else {
                logger.error(`call_bundle simulation failed for ${strat.id}`);
              }
            }
            //logger.debug(`REWARD FOR ${strat.id}: ${usdtReward / 1e6}`);
          } catch (error) {
            logger.error(`error on ${strat.id}: ${error}`);
          }
        });
      } catch (error) {
        logger.error(error);
      }
    });
})();
