import {
  AddressLookupTableAccount,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { connection, wallet } from "../config";
import bs58 from "bs58";
import { wait } from "../utils";
import axios from "axios";
/**
 * 发送交易到jito
 * @param jitoTip
 * @param tx
 * @param luts 地址查找表相关的 暂时没去了解
 * @param priorityFee
 * @returns
 */
export const sendTxJito = async (
  jitoTip: number, // in ui
  tx: Transaction,
  luts?: AddressLookupTableAccount[],
  priorityFee?: number
) => {
  const jitoTipInLamport = jitoTip * LAMPORTS_PER_SOL;

  if (jitoTip == 0) {
    throw Error("Jito bundle tip has not been set.");
  }

  if (priorityFee) {
    const priorityFeeMicroLamports = priorityFee * LAMPORTS_PER_SOL * 1_000_000;
    console.log(`priorityFeeMicroLamports :: ${priorityFeeMicroLamports}`);

    tx.instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: Math.round(priorityFeeMicroLamports),
      })
    );
  }

  // https://jito-foundation.gitbook.io/mev/mev-payment-and-distribution/on-chain-addresses
  // 添加向Jito转小费的指令
  tx.instructions.push(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(
        "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL" // Jito tip account
      ),
      lamports: jitoTipInLamport, // tip
    })
  );

  const recentBlockhash = await connection.getLatestBlockhash();
  //使用v0 交易方式 发送交易到jito
  let vTx: VersionedTransaction = new VersionedTransaction(
    new TransactionMessage({
      payerKey: wallet.publicKey,
      recentBlockhash: recentBlockhash.blockhash,
      instructions: tx.instructions,
    }).compileToV0Message([...(luts ?? [])])
  );

  const totalSize = vTx.message.serialize().length;
  const totalKeys = vTx.message.getAccountKeys({
    addressLookupTableAccounts: luts,
  }).length;

  if (totalSize > 1232 || totalKeys >= 64) {
    console.log("tx size is too big");
    return false;
  }
  //  签名
  vTx = (await wallet.signTransaction(vTx)) as VersionedTransaction;
  // 序列化
  let rawTx = vTx.serialize();

  const messageEncoded = Buffer.from(vTx.message.serialize()).toString(
    "base64"
  );
  //  发送交易
  const encodedTx = bs58.encode(rawTx);
  const jitoURL = "https://mainnet.block-engine.jito.wtf/api/v1/transactions";
  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "sendTransaction",
    params: [
      encodedTx,
      {
        maxRetries: 0,
        skipPreflight: true,
        preflightCommitment: "processed",
      },
    ],
  };
  // let txOpts = commitmentConfig(provider.connection.commitment);
  let txSig: string;

  try {
    const response = await axios.post(jitoURL, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(`JitoResponse :: ${JSON.stringify(response.data)}`);

    txSig = response.data.result;
    console.log(`txSig :: ${txSig}`);
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Jito Bundle Error: cannot send.");
  }

  let currentBlockHeight = await connection.getBlockHeight(
    connection.commitment
  );

  while (currentBlockHeight < recentBlockhash.lastValidBlockHeight) {
    // Keep resending to maximise the chance of confirmation
    const txSigHash = await connection.sendRawTransaction(rawTx, {
      skipPreflight: true,
      preflightCommitment: connection.commitment,
      maxRetries: 0,
    });
    console.log(txSigHash);

    let signatureStatus = await connection.getSignatureStatus(txSig);
    console.log("signatureStatus", signatureStatus.value);

    currentBlockHeight = await connection.getBlockHeight(connection.commitment);

    if (signatureStatus.value != null) {
      if (
        signatureStatus.value?.confirmationStatus === "processed" ||
        signatureStatus.value?.confirmationStatus === "confirmed" ||
        signatureStatus.value?.confirmationStatus === "finalized"
      ) {
        return txSig;
      }
    }
    await wait(500);
  }
  throw Error(`Transaction ${txSig} was not confirmed`);
};
