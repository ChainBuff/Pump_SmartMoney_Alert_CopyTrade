import { BN, Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { PUMP_FUN_IDL, PumpFun } from "../../IDL";
import {
  anchorProvider,
  connection,
  IS_JITO,
  JITO_FEE,
  keypair,
  PUMP_FUN_PROGRAM_ID,
  wallet,
} from "../../config";
import {
  formatLamp,
  getOrCreateAssociatedTokenAccountTransaction,
} from "../../utils";
import getBondingCurvePDA from "./helper/getBondingCurvePDA";
import getBondingCurveTokenAccountWithRetry from "./helper/getBondingCurveTOkenAccountWithRetry";
import { tokenDataFromBondingCurveTokenAccBuffer } from "./helper/tokenDataFromBondingCurveTokenAccBuffer";
import { getBuyPrice } from "./helper/getBuyTokenPrice";
import { sendTxJito } from "../../jito";
const BOANDING_CURVE_ACC_RETRY_AMOUNT = 50;
const BOANDING_CURVE_ACC_RETRY_DELAY = 10;
const PUMP_FUN_FEE_ACCOUNT = "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM";
/**
 * 购买代币
 * @param tokenMintAccount pump代币账户
 * @param solAmount
 * @param slippage
 * @param priorityFee
 */
const buyToken = async (
  tokenMintAccount: PublicKey,
  solAmount: number = 0.01,
  slippage: number = 2.5,
  priorityFee?: number
) => {
  try {
    console.time("functionName");
    const program = new Program<PumpFun>(
      PUMP_FUN_IDL as PumpFun,
      anchorProvider
    );
    //
    const transaction = new Transaction();
    // AT
    const myAssociatedTokenAddress = await getAssociatedTokenAddress(
      tokenMintAccount,
      keypair.publicKey
    );
    // ATA
    await getOrCreateAssociatedTokenAccountTransaction(
      connection,
      myAssociatedTokenAddress,
      tokenMintAccount,
      keypair,
      transaction
    );
    // 不要纠结与为什么获取这些账户  问就是：IDL文件规定了 要获取这些账户 也是rust 程序中 [Accounts] 这个宏规定的
    // 在account规则.md文件中有对IDL文件的解释  查看 IDL 的 buy方法的 json数据
    // 获取曲线账户 不懂的 我在pumpfun结构.md文件 写了AI的回答
    const programId = new PublicKey(PUMP_FUN_PROGRAM_ID);
    const bondingCurve = getBondingCurvePDA(tokenMintAccount, programId);
    // 获取曲线账户的ATA
    const associatedBondingCurve = await getAssociatedTokenAddress(
      tokenMintAccount,
      bondingCurve,
      true
    );
    // 获取账户数据
    const bondingCurveTokenAccount = await getBondingCurveTokenAccountWithRetry(
      connection,
      bondingCurve,
      BOANDING_CURVE_ACC_RETRY_AMOUNT,
      BOANDING_CURVE_ACC_RETRY_DELAY
    );
    if (bondingCurveTokenAccount === null) {
      throw new Error("Bonding curve account not found");
    }
    // bondingCurveTokenAccount数据转成可以看的明白的数据^_^  方法SDK里 copy的
    const bondingCurveTokenAccountFormatData =
      tokenDataFromBondingCurveTokenAccBuffer(bondingCurveTokenAccount.data);
    // complete = true 代表 内盘结束
    if (bondingCurveTokenAccountFormatData.complete) {
      throw new Error("Bonding curve already completed");
    }
    // tx
    const SLIPPAGE_POINTS = slippage * 100;
    const solAmountLamp = formatLamp(solAmount);
    const buyAmountToken = getBuyPrice(
      solAmountLamp,
      bondingCurveTokenAccountFormatData
    );
    const buyAmountSolWithSlippage =
      solAmountLamp + (solAmountLamp * SLIPPAGE_POINTS) / 10000;
    // TODO:查资料 这里是 固定值好  还是 使用 模拟交易 查询出来的好
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 600000,
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 0.002 * LAMPORTS_PER_SOL,
    });

    const latestBlockhash = await connection.getLatestBlockhash();
    // 交易 transaction 指令
    transaction
      .add(modifyComputeUnits)
      .add(addPriorityFee)
      .add(
        await program.methods
          .buy(
            new BN(buyAmountToken.toString()),
            new BN(buyAmountSolWithSlippage.toString())
          )
          .accounts({
            feeRecipient: new PublicKey(PUMP_FUN_FEE_ACCOUNT),
            mint: tokenMintAccount,
            associatedBondingCurve: associatedBondingCurve,
            associatedUser: myAssociatedTokenAddress,
            user: keypair.publicKey,
          })
          .transaction()
      );
    transaction.feePayer = keypair.publicKey;
    transaction.recentBlockhash = latestBlockhash.blockhash;
    // Jito
    if (IS_JITO) {
      try {
        const txSig = await sendTxJito(JITO_FEE, transaction);
        console.log(`跟单成功 使用Jito:\n https://solscan.io/tx/${txSig}`);
      } catch (error) {
        console.error(error);
      }
    } else {
      // simulate
      // const simulationResult = await connection.simulateTransaction(
      //   signedTransaction
      // );
      // console.timeEnd("functionName");
      // console.log("===========================================");
      // console.log(JSON.stringify(simulationResult));
      // console.log("===========================================");
      // const txSig = await sendAndConfirmTransaction(
      //   connection,
      //   signedTransaction,
      //   [keypair],
      //   { skipPreflight: true, commitment: "confirmed" }
      // );
      // const signedTransaction = await wallet.signTransaction(transaction);
      // const txSig = await connection.sendTransaction(
      //   signedTransaction,
      //   [keypair],
      //   { preflightCommitment: "confirmed", skipPreflight: true }
      // );
      // await connection.confirmTransaction(txSig, "confirmed");
      // const txSig = await connection.sendRawTransaction(
      //   signedTransaction.serialize(),
      //   {
      //     skipPreflight: true,
      //   }
      // );
      // console.log(`跟单成功 未使用Jito:\n https://solscan.io/tx/${txSig}`);
    }
  } catch (error) {
    console.error("buyToken失败", error);
    throw new Error(error as any);
  }
};
export { buyToken };
