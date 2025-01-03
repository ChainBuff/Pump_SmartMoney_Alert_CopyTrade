import dotenv from "dotenv";
import { Connection, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import bs58 from "bs58";
dotenv.config();
// rpc
const GRPC_URL_MAIN = process.env.GRPC_URL_MAIN!;
const GRPC_URL_TEST = process.env.GRPC_URL_TEST!;
const RPC_ENDPOINT = process.env.RPC_ENDPOINT!;
//
const keypair = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));

// tg
const TG_API_TOKEN = process.env.TG_API_TOKEN!;
const TG_CHAT_ID = process.env.TG_CHAT_ID!;
const TG_MESSAGE_THREAD_ID = process.env.TG_MESSAGE_THREAD_ID!;

// twitter
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN!;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET!;
const TWITTER_API_KEY = process.env.TWITTER_API_KEY!;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET!;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const JITO_FEE = process.env.JITO_FEE!;

// ai
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const Grok_API_KEY = process.env.Grok_API_KEY!;
// Jito
const IS_JITO = process.env.IS_JITO!;

// =========SubscribeRequestConfig========== //
const PUMP_FUN_PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";

const connection = new Connection(RPC_ENDPOINT, {
  commitment: "processed",
});
const wallet = new Wallet(keypair);
const anchorProvider = new AnchorProvider(connection, wallet, {
  commitment: "processed",
  skipPreflight: true,
});
// jito 小费账户
// https://jito-foundation.gitbook.io/mev/mev-payment-and-distribution/on-chain-addresses
const jito_tip_account = [
  "96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5",
  "HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe",
  "Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY",
  "ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49",
  "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh",
  "ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt",
  "DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL",
  "3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT",
];
export {
  OPENAI_API_KEY,
  Grok_API_KEY,
  //
  GRPC_URL_MAIN,
  GRPC_URL_TEST,
  //
  TG_API_TOKEN,
  TG_CHAT_ID,
  TG_MESSAGE_THREAD_ID,
  //
  connection,
  anchorProvider,
  keypair,
  wallet,
  //
  TWITTER_ACCESS_TOKEN,
  TWITTER_ACCESS_TOKEN_SECRET,
  TWITTER_API_KEY,
  TWITTER_API_SECRET,
  TWITTER_BEARER_TOKEN,
  PUMP_FUN_PROGRAM_ID,
  //
  IS_JITO,
  jito_tip_account,
  JITO_FEE,
};
